import fastify from 'fastify';

export function buildFastifyApp() {
  const app = fastify({ logger: true });
  return app;
}
