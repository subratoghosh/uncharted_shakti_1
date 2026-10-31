import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createComparePipeline, createHotspotsPipeline } from '../src/modules/runs/pipelines.js';
import { migrate } from '../src/db/migrate.js';
import { sha256 } from '../src/lib/hash.js';

describe('MongoDB Schema, Indexes, Race Conditions & Aggregations (testing.md §4, §6)', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('shaktiq_test');

    // Run migration
    await migrate(db);
  }, 30000);

  afterAll(async () => {
    if (client) await client.close();
    if (mongod) await mongod.stop();
  });

  it('migration creates all 8 collections with indexes and validators', async () => {
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);

    expect(names).toContain('users');
    expect(names).toContain('apiTokens');
    expect(names).toContain('projects');
    expect(names).toContain('events');
    expect(names).toContain('runs');
    expect(names).toContain('findings');
    expect(names).toContain('specSnapshots');
    expect(names).toContain('notifications');

    // Check unique indexes
    const eventIndexes = await db.collection('events').listIndexes().toArray();
    const eventIdIndex = eventIndexes.find(i => i.name === 'eventId_1');
    expect(eventIdIndex).toBeDefined();
    expect(eventIdIndex?.unique).toBe(true);

    const runIndexes = await db.collection('runs').listIndexes().toArray();
    const runEventIdIndex = runIndexes.find(i => i.name === 'eventId_1');
    expect(runEventIdIndex).toBeDefined();
    expect(runEventIdIndex?.unique).toBe(true);
  });

  it('schema validator rejects documents with invalid fields', async () => {
    const events = db.collection('events');
    // Invalid source 'invalid_source'
    await expect(
      events.insertOne({
        eventId: 'github:valid-uuid-here',
        eventType: 'github.push',
        source: 'invalid_source' as any,
        receivedAt: new Date(),
        processingStatus: 'received',
        duplicateCount: 0,
      }),
    ).rejects.toThrow();
  });

  it('handles 20 parallel duplicate webhook deliveries with atomic deduplication', async () => {
    const events = db.collection('events');
    const runs = db.collection('runs');
    const projectId = new ObjectId();
    const deliveryId = `github:race-test-${Date.now()}`;

    // Simulate 20 parallel intake operations
    const intakeEvent = async () => {
      try {
        await events.insertOne({
          _id: new ObjectId(),
          eventId: deliveryId,
          projectId,
          eventType: 'github.push',
          source: 'github',
          receivedAt: new Date(),
          processingStatus: 'dispatched',
          runId: null,
          duplicateCount: 0,
        });

        // Insert run
        await runs.insertOne({
          _id: new ObjectId(),
          projectId,
          eventId: deliveryId,
          source: 'github',
          currentVersion: 'HEAD',
          status: 'queued',
          createdAt: new Date(),
          aiStatus: 'disabled',
        });
        return { duplicate: false };
      } catch (err: any) {
        if (err.code === 11000) {
          await events.updateOne(
            { eventId: deliveryId },
            { $inc: { duplicateCount: 1 }, $set: { lastDuplicateAt: new Date() } },
          );
          return { duplicate: true };
        }
        throw err;
      }
    };

    const results = await Promise.all(Array.from({ length: 20 }, () => intakeEvent()));

    const duplicates = results.filter(r => r.duplicate).length;
    const initial = results.filter(r => !r.duplicate).length;

    expect(initial).toBe(1);
    expect(duplicates).toBe(19);

    const savedEvent = await events.findOne({ eventId: deliveryId });
    expect(savedEvent?.duplicateCount).toBe(19);

    const savedRuns = await runs.find({ eventId: deliveryId }).toArray();
    expect(savedRuns.length).toBe(1);
  });

  it('run-to-run compare aggregation classifies new, resolved, and unresolved findings', async () => {
    const findings = db.collection('findings');
    const projectId = new ObjectId();
    const runA = new ObjectId();
    const runB = new ObjectId();
    const now = new Date();

    const fpDelete = sha256('fp_delete_orders');
    const fpPost = sha256('fp_post_orders_req');
    const fpGet = sha256('fp_get_orders_param');

    const f1 = {
      _id: new ObjectId(),
      projectId,
      runId: runA,
      fingerprint: fpDelete,
      endpoint: '/orders/{id}',
      method: 'DELETE' as const,
      changeType: 'ENDPOINT_REMOVED' as const,
      severity: 'breaking' as const,
      ruleId: 'path-removed',
      description: 'DELETE removed',
      impact: 'none',
      recommendation: 'none',
      createdAt: now,
    };

    const f2 = {
      _id: new ObjectId(),
      projectId,
      runId: runA,
      fingerprint: fpPost,
      endpoint: '/orders',
      method: 'POST' as const,
      changeType: 'REQUIRED_REQUEST_FIELD_ADDED' as const,
      severity: 'breaking' as const,
      ruleId: 'field-required',
      description: 'Required field added',
      impact: 'none',
      recommendation: 'none',
      createdAt: now,
    };

    const f2_in_b = {
      ...f2,
      _id: new ObjectId(),
      runId: runB,
    };

    const f3_in_b = {
      _id: new ObjectId(),
      projectId,
      runId: runB,
      fingerprint: fpGet,
      endpoint: '/orders',
      method: 'GET' as const,
      changeType: 'REQUIRED_PARAMETER_ADDED' as const,
      severity: 'breaking' as const,
      ruleId: 'param-required',
      description: 'Required param added',
      impact: 'none',
      recommendation: 'none',
      createdAt: now,
    };

    await findings.insertMany([f1, f2, f2_in_b, f3_in_b]);

    const pipeline = createComparePipeline(projectId, runA, runB);
    const results = await findings.aggregate(pipeline).toArray();

    expect(results.length).toBe(3);

    const resolved = results.find((r: any) => r.diffStatus === 'resolved');
    expect(resolved?.fingerprint).toBe(fpDelete);

    const unresolved = results.find((r: any) => r.diffStatus === 'unresolved');
    expect(unresolved?.fingerprint).toBe(fpPost);

    const newFinding = results.find((r: any) => r.diffStatus === 'new');
    expect(newFinding?.fingerprint).toBe(fpGet);
  });

  it('hotspots pipeline identifies recurring broken endpoints across runs', async () => {
    const findings = db.collection('findings');
    const projectId = new ObjectId();
    const run1 = new ObjectId();
    const run2 = new ObjectId();
    const now = new Date();

    await findings.insertMany([
      {
        _id: new ObjectId(),
        projectId,
        runId: run1,
        fingerprint: sha256('fp1'),
        endpoint: '/orders/{id}',
        method: 'DELETE',
        changeType: 'ENDPOINT_REMOVED',
        severity: 'breaking',
        ruleId: 'rule1',
        description: 'd1',
        impact: 'i1',
        recommendation: 'r1',
        createdAt: now,
      },
      {
        _id: new ObjectId(),
        projectId,
        runId: run2,
        fingerprint: sha256('fp2'),
        endpoint: '/orders/{id}',
        method: 'DELETE',
        changeType: 'METHOD_REMOVED',
        severity: 'breaking',
        ruleId: 'rule2',
        description: 'd2',
        impact: 'i2',
        recommendation: 'r2',
        createdAt: now,
      },
      {
        _id: new ObjectId(),
        projectId,
        runId: run1,
        fingerprint: sha256('fp3'),
        endpoint: '/users',
        method: 'GET',
        changeType: 'OPTIONAL_FIELD_ADDED',
        severity: 'info', // non-breaking
        ruleId: 'rule3',
        description: 'd3',
        impact: 'i3',
        recommendation: 'r3',
        createdAt: now,
      },
    ]);

    const pipeline = createHotspotsPipeline(projectId);
    const hotspots = await findings.aggregate(pipeline).toArray();

    expect(hotspots.length).toBe(1);
    expect(hotspots[0].endpoint).toBe('/orders/{id}');
    expect(hotspots[0].distinctRuns).toBe(2);
    expect(hotspots[0].occurrences).toBe(2);
  });
});
