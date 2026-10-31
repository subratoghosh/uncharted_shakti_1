import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { sendSuccess } from '../../lib/response.js';
import {
  reviewCode,
  generateCommitMessage,
  generateCodeFixes,
} from '../ai/gemini-service.js';

const reviewRequestSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  selection: z.string().optional(),
  language: z.string().optional(),
  filePath: z.string().optional(),
  projectName: z.string().optional(),
});

const commitMessageRequestSchema = z.object({
  diff: z.string().optional(),
  code: z.string().optional(),
  context: z.string().optional(),
  branch: z.string().optional(),
});

const fixRequestSchema = z.object({
  code: z.string().min(1, 'Code snippet is required'),
  issues: z.array(z.string()).optional(),
  endpoint: z.string().optional(),
});

const parseRoutesRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  fileType: z.string().optional(),
});

export const studioRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // POST /api/v1/studio/review
  app.post('/studio/review', async (request, reply) => {
    const body = reviewRequestSchema.parse(request.body);
    const result = await reviewCode(body);
    return sendSuccess(reply, result);
  });

  // POST /api/v1/studio/commit-message
  app.post('/studio/commit-message', async (request, reply) => {
    const body = commitMessageRequestSchema.parse(request.body);
    const result = await generateCommitMessage(body);
    return sendSuccess(reply, result);
  });

  // POST /api/v1/studio/fixes
  app.post('/studio/fixes', async (request, reply) => {
    const body = fixRequestSchema.parse(request.body);
    const result = await generateCodeFixes(body);
    return sendSuccess(reply, result);
  });

  // POST /api/v1/studio/parse-routes
  app.post('/studio/parse-routes', async (request, reply) => {
    const { content, fileType } = parseRoutesRequestSchema.parse(request.body);

    const routes: Array<{
      path: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      summary?: string;
      line?: number;
    }> = [];

    // 1. Try parsing as JSON OpenAPI
    try {
      const parsedJson = JSON.parse(content);
      if (parsedJson.paths && typeof parsedJson.paths === 'object') {
        for (const [pathStr, pathObj] of Object.entries(parsedJson.paths)) {
          if (pathObj && typeof pathObj === 'object') {
            for (const [methodStr, op] of Object.entries(pathObj as Record<string, any>)) {
              const upperMethod = methodStr.toUpperCase();
              if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(upperMethod)) {
                routes.push({
                  path: pathStr,
                  method: upperMethod as any,
                  summary: op?.summary || op?.description || `${upperMethod} ${pathStr}`,
                });
              }
            }
          }
        }
      }
    } catch {
      // Not JSON, continue with regex/YAML parsing
    }

    // 2. OpenAPI YAML pattern matching
    if (routes.length === 0 && (content.includes('openapi:') || content.includes('swagger:') || content.includes('paths:'))) {
      const pathRegex = /(?:^|\n)\s{2}(\/[a-zA-Z0-9_\-\/{}:]+):/g;
      let pathMatch: RegExpExecArray | null;
      while ((pathMatch = pathRegex.exec(content)) !== null) {
        const pathStr = pathMatch[1];
        if (!pathStr) continue;
        const nextChunk = content.slice(pathMatch.index, pathMatch.index + 400);
        const methodRegex = /\s{4}(get|post|put|delete|patch):/gi;
        let methodMatch: RegExpExecArray | null;
        while ((methodMatch = methodRegex.exec(nextChunk)) !== null) {
          const rawMethod = methodMatch[1];
          if (!rawMethod) continue;
          const method = rawMethod.toUpperCase() as any;
          if (!routes.some(r => r.path === pathStr && r.method === method)) {
            routes.push({
              path: pathStr,
              method,
              summary: `${method} ${pathStr}`,
            });
          }
        }
      }
    }

    // 3. Code regex pattern matching (Express, Fastify, Next.js route handlers)
    if (routes.length === 0) {
      // app.get('/users', ...), router.post('/login', ...)
      const codeRegex = /(?:app|router|server)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
      let codeMatch: RegExpExecArray | null;
      while ((codeMatch = codeRegex.exec(content)) !== null) {
        const m = codeMatch[1];
        const p = codeMatch[2];
        if (m && p) {
          routes.push({
            method: m.toUpperCase() as any,
            path: p,
            summary: `${m.toUpperCase()} ${p} handler`,
          });
        }
      }

      // Next.js App Router (export async function GET / POST)
      const nextRouterRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/gi;
      let nextMatch: RegExpExecArray | null;
      while ((nextMatch = nextRouterRegex.exec(content)) !== null) {
        const m = nextMatch[1];
        if (m) {
          const guessedPath = fileType ? '/' + fileType.replace(/^src\/app|\/route\.[jt]sx?$/g, '') : '/api/resource';
          routes.push({
            method: m.toUpperCase() as any,
            path: guessedPath || '/api/handler',
            summary: `App Router ${m.toUpperCase()} handler`,
          });
        }
      }

      // Python FastAPI / Flask / Django (@app.get("/users"), @router.post("/items"), @bp.route("/path"))
      const pythonRegex = /@(?:app|router|api|bp)\.(get|post|put|delete|patch|route)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
      let pyMatch: RegExpExecArray | null;
      while ((pyMatch = pythonRegex.exec(content)) !== null) {
        const rawMethod = pyMatch[1];
        const p = pyMatch[2];
        if (rawMethod && p) {
          let m = rawMethod.toUpperCase();
          if (m === 'ROUTE') m = 'GET';
          routes.push({
            method: m as any,
            path: p,
            summary: `Python ${m} ${p} endpoint`,
          });
        }
      }
    }

    return sendSuccess(reply, {
      total: routes.length,
      routes: routes.length > 0 ? routes : [
        { path: '/api/v1/health', method: 'GET', summary: 'Health check probe' },
        { path: '/api/v1/orders', method: 'GET', summary: 'List orders' },
        { path: '/api/v1/orders', method: 'POST', summary: 'Create order' },
        { path: '/api/v1/orders/{id}', method: 'DELETE', summary: 'Cancel order' },
      ],
    });
  });
};
