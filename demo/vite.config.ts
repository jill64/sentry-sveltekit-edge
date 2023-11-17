import { sentryVitePlugin } from '@sentry/vite-plugin'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: true
  },
  plugins: [
    sentryVitePlugin({
      org: 'jill64',
      project: 'sentry-sveltekit-edge',
      authToken: process.env.SENTRY_AUTH_TOKEN
    }),
    sveltekit()
  ],
  server: {
    fs: {
      allow: ['../dist']
    }
  }
})
