import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reportsDirectory: './tests/coverage',
      provider: 'istanbul' // or 'v8'
    }
  },
  resolve: {
    alias: {
      '#imports': path.resolve(__dirname, 'utils/empty.ts')
    }
  }
})
