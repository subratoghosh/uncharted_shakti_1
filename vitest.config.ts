import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://localhost:27017/shaktiq_test',
      MONGODB_DB: 'shaktiq_test',
      JWT_SECRET: 'test-jwt-secret-minimum-32-characters-long',
      INTERNAL_API_KEY: 'test-internal-api-key-minimum-32-characters',
      GITHUB_WEBHOOK_SECRET: 'test-github-webhook-secret',
    },
  },
});
