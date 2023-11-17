import auto from '@sveltejs/adapter-auto'
import cloudflare from '@sveltejs/adapter-cloudflare'
import netlify from '@sveltejs/adapter-netlify'
import vercel from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/kit/vite'

const { NETLIFY, CF_PAGES, VERCEL } = process.env

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: NETLIFY
      ? netlify({
          edge: true
        })
      : VERCEL
        ? vercel({
            edge: true
          })
        : CF_PAGES
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
