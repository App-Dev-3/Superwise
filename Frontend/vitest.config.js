import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

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
})
