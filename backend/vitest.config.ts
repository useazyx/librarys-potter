import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/librarys_potter_test?schema=public',
      JWT_SECRET: 'test-secret-librarys-potter-1997',
      CORS_ORIGIN: 'http://localhost:5174',
    },
    hookTimeout: 120_000,
    testTimeout: 30_000,
    // Every suite shares one seeded database, so they must not run concurrently.
    fileParallelism: false,
  },
})
