import cloudflare from '@sveltejs/adapter-cloudflare'
import netlify from '@sveltejs/adapter-netlify'
import vercel from '@sveltejs/adapter-vercel'
import auto from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/kit/vite'

const host = process.env.PREVIEW_HOST

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: host.includes('netlify.app')
      ? netlify({
          edge: true
        })
      : host.includes('vercel.app')
        ? vercel({
            edge: true
          })
        : host.includes('pages.dev')
          ? cloudflare()
          : auto(),
    prerender: {
      crawl: false
    },
    alias: {
      $dist: '../dist'
    }
  }
}

export default config
