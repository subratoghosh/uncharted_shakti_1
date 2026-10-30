// n8n Stub API - owned by Vicky
import Fastify from 'fastify';

export const app = Fastify({ logger: false });

app.get('/health', async () => ({ ok: true, stub: true }));

if (process.env.NODE_ENV !== 'test') {
  app.listen({ port: 4000, host: '0.0.0.0' }, err => {
    if (err) {
      process.exit(1);
    }
  });
}
