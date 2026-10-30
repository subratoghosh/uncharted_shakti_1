import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import {
  AppError,
  createProjectRequestSchema,
  ROUTES,
  updateProjectRequestSchema,
} from '@shaktiq/shared';
import { getCollections } from '../../db/collections.js';
import { sendSuccess } from '../../lib/response.js';
import { authenticate, verifyProjectOwnership } from '../../plugins/auth.js';

export const projectRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /projects
  app.get(ROUTES.PROJECTS.LIST, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projects } = getCollections();

    const filter = user.role === 'admin' ? {} : { ownerUserId: new ObjectId(user.id) };
    const list = await projects.find(filter).sort({ createdAt: -1 }).toArray();

    return sendSuccess(
      reply,
      list.map(p => ({
        id: p._id.toHexString(),
        ownerUserId: p.ownerUserId.toHexString(),
        name: p.name,
        repositoryUrl: p.repositoryUrl,
        owner: p.owner,
        repo: p.repo,
        fullName: p.fullName,
        defaultBranch: p.defaultBranch,
        specPath: p.specPath,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    );
  });

  // POST /projects
  app.post(ROUTES.PROJECTS.CREATE, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const body = createProjectRequestSchema.parse(request.body);
    const { projects } = getCollections();

    // Extract owner and repo from https://github.com/owner/repo
    const parts = body.repositoryUrl.replace(/^https:\/\/github\.com\//, '').split('/');
    const owner = parts[0]!;
    const repo = parts[1]!;
    const fullName = `${owner}/${repo}`.toLowerCase();

    const now = new Date();
    const newProject = {
      _id: new ObjectId(),
      ownerUserId: new ObjectId(user.id),
      name: body.name,
      repositoryUrl: body.repositoryUrl,
      owner,
      repo,
      fullName,
      defaultBranch: body.defaultBranch,
      specPath: body.specPath,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await projects.insertOne(newProject);
    } catch (err: any) {
      if (err.code === 11000) {
        throw new AppError('CONFLICT', 'A project for this repository is already registered');
      }
      throw err;
    }

    return sendSuccess(
      reply,
      {
        id: newProject._id.toHexString(),
        ownerUserId: newProject.ownerUserId.toHexString(),
        name: newProject.name,
        repositoryUrl: newProject.repositoryUrl,
        owner: newProject.owner,
        repo: newProject.repo,
        fullName: newProject.fullName,
        defaultBranch: newProject.defaultBranch,
        specPath: newProject.specPath,
        createdAt: newProject.createdAt.toISOString(),
        updatedAt: newProject.updatedAt.toISOString(),
      },
      201,
    );
  });

  // GET /projects/:projectId
  app.get(ROUTES.PROJECTS.GET, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projectId } = request.params as { projectId: string };

    await verifyProjectOwnership(projectId, user);

    const { projects } = getCollections();
    const project = await projects.findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      throw new AppError('NOT_FOUND', 'Project not found');
    }

    return sendSuccess(reply, {
      id: project._id.toHexString(),
      ownerUserId: project.ownerUserId.toHexString(),
      name: project.name,
      repositoryUrl: project.repositoryUrl,
      owner: project.owner,
      repo: project.repo,
      fullName: project.fullName,
      defaultBranch: project.defaultBranch,
      specPath: project.specPath,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  });

  // PATCH /projects/:projectId
  app.patch(ROUTES.PROJECTS.UPDATE, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projectId } = request.params as { projectId: string };
    const body = updateProjectRequestSchema.parse(request.body);

    await verifyProjectOwnership(projectId, user);

    const { projects } = getCollections();
    const updateFields: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.defaultBranch !== undefined) updateFields.defaultBranch = body.defaultBranch;
    if (body.specPath !== undefined) updateFields.specPath = body.specPath;

    await projects.updateOne({ _id: new ObjectId(projectId) }, { $set: updateFields });

    const updated = await projects.findOne({ _id: new ObjectId(projectId) });

    return sendSuccess(reply, {
      id: updated!._id.toHexString(),
      ownerUserId: updated!.ownerUserId.toHexString(),
      name: updated!.name,
      repositoryUrl: updated!.repositoryUrl,
      owner: updated!.owner,
      repo: updated!.repo,
      fullName: updated!.fullName,
      defaultBranch: updated!.defaultBranch,
      specPath: updated!.specPath,
      createdAt: updated!.createdAt.toISOString(),
      updatedAt: updated!.updatedAt.toISOString(),
    });
  });

  // DELETE /projects/:projectId
  app.delete(ROUTES.PROJECTS.DELETE, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projectId } = request.params as { projectId: string };

    await verifyProjectOwnership(projectId, user);

    const projectObjId = new ObjectId(projectId);
    const { projects, runs, findings, specSnapshots, events, notifications } = getCollections();

    // Cascading delete per database.md section 9
    await Promise.all([
      projects.deleteOne({ _id: projectObjId }),
      runs.deleteMany({ projectId: projectObjId }),
      findings.deleteMany({ projectId: projectObjId }),
      specSnapshots.deleteMany({ projectId: projectObjId }),
      events.deleteMany({ projectId: projectObjId }),
      notifications.deleteMany({ projectId: projectObjId }),
    ]);

    return sendSuccess(reply, { deleted: true });
  });
};
