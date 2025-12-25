import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom environment for browser APIs
    environment: 'jsdom',

    // Global test setup file
    setupFiles: ['./tests/setup.js'],

    // Include patterns
    include: ['tests/**/*.test.{js,jsx}'],

    // Globals (allows using expect, describe, it without importing)
    globals: true,

    // Test timeout for long-running integration tests with production APIs
    // Phase 3: Increased to 60s for real openpv.de API calls
    testTimeout: 60000,

    // Retry failed tests (helps with flaky API-dependent tests)
    retry: 1
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.PUBLIC_URL': JSON.stringify(''),
  },
})
