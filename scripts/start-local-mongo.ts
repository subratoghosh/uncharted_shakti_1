import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';
import { migrate } from '../apps/api/src/db/migrate.js';
import { sha256 } from '../apps/api/src/lib/hash.js';

async function start() {
  console.log('🚀 Starting local MongoDB ReplicaSet (WiredTiger) on port 27017...');

  const repl = await MongoMemoryReplSet.create({
    replSet: {
      name: 'rs0',
      count: 1,
      storageEngine: 'wiredTiger',
    },
    instanceOpts: [
      {
        port: 27017,
      },
    ],
  });

  const uri = repl.getUri();
  console.log(`✅ MongoDB running at: ${uri}`);

  // Connect and run migrations & seed demo data
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('shaktiq');

  console.log('📦 Running database migrations and schema setup...');
  await migrate(db);

  // Seed sample project if none exists
  const projectsCol = db.collection('projects');
  const projectCount = await projectsCol.countDocuments();

  if (projectCount === 0) {
    console.log('🌱 Seeding demo project and analysis history...');
    const usersCol = db.collection('users');
    const admin = await usersCol.findOne({ email: 'admin@shaktiq.dev' });
    const adminId = admin ? admin._id : new ObjectId();

    const projectId = new ObjectId();
    const now = new Date();

    await projectsCol.insertOne({
      _id: projectId,
      ownerUserId: adminId,
      name: 'Orders Service',
      repositoryUrl: 'https://github.com/shaktiq/orders-service',
      owner: 'shaktiq',
      repo: 'orders-service',
      fullName: 'shaktiq/orders-service',
      defaultBranch: 'main',
      specPath: 'openapi.yaml',
      createdAt: now,
      updatedAt: now,
    });

    const runsCol = db.collection('runs');
    const findingsCol = db.collection('findings');

    // Seed Run 1 (Earlier run with 1 breaking change on /orders/{id})
    const run1Id = new ObjectId();
    const pastTime = new Date(Date.now() - 3600000 * 24);

    await runsCol.insertOne({
      _id: run1Id,
      projectId,
      eventId: 'evt_demo_initial_seed_1',
      source: 'github',
      status: 'completed',
      currentVersion: '1.1.0',
      createdAt: pastTime,
      summary: {
        total: 3,
        breaking: 1,
        warning: 0,
        info: 2,
        releaseStatus: 'blocked',
      },
    });

    await findingsCol.insertOne({
      _id: new ObjectId(),
      projectId,
      runId: run1Id,
      endpoint: '/orders/{id}',
      method: 'DELETE',
      changeType: 'ENDPOINT_REMOVED',
      severity: 'breaking',
      description: 'Path /orders/{id} was removed',
      impact: 'Consumer order cancellations will fail with 404 Not Found',
      recommendation: 'Maintain DELETE /orders/{id} with deprecated: true header',
      fingerprint: sha256('orders_delete_v1'),
      createdAt: pastTime,
    });

    // Seed Run 2 (Latest run with 2 breaking findings, forming recurring hotspot on /orders/{id})
    const run2Id = new ObjectId();
    await runsCol.insertOne({
      _id: run2Id,
      projectId,
      eventId: 'evt_demo_initial_seed_2',
      source: 'github',
      status: 'completed',
      currentVersion: '2.0.0',
      createdAt: now,
      summary: {
        total: 4,
        breaking: 2,
        warning: 1,
        info: 1,
        releaseStatus: 'blocked',
      },
    });

    await findingsCol.insertMany([
      {
        _id: new ObjectId(),
        projectId,
        runId: run2Id,
        endpoint: '/orders/{id}',
        method: 'DELETE',
        changeType: 'ENDPOINT_REMOVED',
        severity: 'breaking',
        description: 'Path /orders/{id} was completely removed from the OpenAPI specification',
        impact: 'Client applications calling DELETE /orders/{id} will receive 404 Not Found',
        recommendation: 'Mark endpoint as deprecated for 2 minor versions before removal',
        fingerprint: sha256('orders_delete_v2'),
        createdAt: now,
      },
      {
        _id: new ObjectId(),
        projectId,
        runId: run2Id,
        endpoint: '/orders',
        method: 'POST',
        changeType: 'REQUIRED_REQUEST_FIELD_ADDED',
        severity: 'breaking',
        description: 'Required property paymentMethodId was added to requestBody',
        impact: 'Existing client payloads lacking paymentMethodId will be rejected with 400 Bad Request',
        recommendation: 'Make paymentMethodId optional with server-side default fallback',
        fingerprint: sha256('orders_post_required_field'),
        createdAt: now,
      },
      {
        _id: new ObjectId(),
        projectId,
        runId: run2Id,
        endpoint: '/orders',
        method: 'POST',
        changeType: 'FIELD_TYPE_CHANGED',
        severity: 'warning',
        description: 'Property amount format changed from number to string',
        impact: 'Strictly-typed SDKs expecting numeric amount may fail to deserialize responses',
        recommendation: 'Accept polymorphic number/string in serializer during migration',
        fingerprint: sha256('orders_post_type_change'),
        createdAt: now,
      },
    ]);

    // Seed sample webhook event
    const eventsCol = db.collection('events');
    await eventsCol.insertOne({
      _id: new ObjectId(),
      eventId: 'evt_mock_github_99812',
      eventType: 'github.push',
      source: 'github',
      projectId,
      receivedAt: now,
      processingStatus: 'processed',
      runId: run2Id,
      duplicateCount: 0,
    });

    console.log('✅ Demo data seeded successfully! Hotspots and findings are ready.');
  }

  console.log('\n🟢 Local MongoDB is ready and running on port 27017.');
  console.log('Press Ctrl+C to terminate the database.\n');

  process.on('SIGINT', async () => {
    console.log('\nStopping MongoDB...');
    await client.close();
    await repl.stop();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('Failed to start local MongoDB:', err);
  process.exit(1);
});
