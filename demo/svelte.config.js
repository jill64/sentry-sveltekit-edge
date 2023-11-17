import cloudflare from '@sveltejs/adapter-cloudflare'
import netlify from '@sveltejs/adapter-netlify'
import vercel from '@sveltejs/adapter-vercel'
import auto from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/kit/vite'

const url = process.env.PREVIEW_URL

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: url.includes('netlify.app') ? netlify({
      edge: true
    }) : url.includes('vercel.app') ? vercel({
      edge: true
    }) : url.includes('pages.dev') ? cloudflare() : auto(),
    prerender: {
      crawl: false
    },
    alias: {
      $dist: '../dist'
    }
  }
}

export default config
