<!----- BEGIN GHOST DOCS HEADER ----->

# @jill64/sentry-sveltekit-edge


<!----- BEGIN GHOST DOCS BADGES ----->
<a href="https://npmjs.com/package/@jill64/sentry-sveltekit-edge"><img src="https://img.shields.io/npm/v/@jill64/sentry-sveltekit-edge" alt="npm-version" /></a> <a href="https://npmjs.com/package/@jill64/sentry-sveltekit-edge"><img src="https://img.shields.io/npm/l/@jill64/sentry-sveltekit-edge" alt="npm-license" /></a> <a href="https://npmjs.com/package/@jill64/sentry-sveltekit-edge"><img src="https://img.shields.io/npm/dm/@jill64/sentry-sveltekit-edge" alt="npm-download-month" /></a> <a href="https://npmjs.com/package/@jill64/sentry-sveltekit-edge"><img src="https://img.shields.io/bundlephobia/min/@jill64/sentry-sveltekit-edge" alt="npm-min-size" /></a> <a href="https://github.com/jill64/sentry-sveltekit-edge/actions/workflows/ci.yml"><img src="https://github.com/jill64/sentry-sveltekit-edge/actions/workflows/ci.yml/badge.svg" alt="ci.yml" /></a>
<!----- END GHOST DOCS BADGES ----->


♟️ Unofficial Sentry integration for SvelteKit edge runtime

<!----- END GHOST DOCS HEADER ----->

## Installation

```sh
npm i @jill64/sentry-sveltekit-edge
```

## Requirements

- Any edge runtime that supports `fetch`

> [!NOTE]
> If running on `Cloudflare Pages`, use instead [`@jill64/sentry-sveltekit-cloudflare`](https://github.com/jill64/sentry-sveltekit-cloudflare).

## Limitations

This library is `@sentry/sveltekit` without the node runtime dependencies.

### Available

- All features for client
- Basic error capture on server

### Unavailable

- Default integrations
- Auto session tracking

## Configuration

Add the following settings to your SvelteKit application's `vite.config.js`.

```js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['@jill64/sentry-sveltekit-edge']
  }
  // ...
})
```

## Usage

### Client

```js
// hooks.client.js
import { init } from '@jill64/sentry-sveltekit-edge/client'
// or
// import { clientInit } from '@jill64/sentry-sveltekit-edge'

const onError = init(
  '__YOUR_SENTRY_DSN__'
  // ,
  // {
  //   sentryOptions: {
  //     // ... Other Sentry Config
  //   },
  //   enableInDevMode: boolean (default: false)
  // }
)

export const handleError = onError((e) => {
  // Your Error Handler
})
```

### Server

```js
// hooks.server.js
import { init } from '@jill64/sentry-sveltekit-edge/server'
// or
// import { serverInit } from '@jill64/sentry-sveltekit-edge'

const { onHandle, onError } = serverInit(
  '__YOUR_SENTRY_DSN__'
  // ,
  // {
  //   sentryOptions?: {
  //     // ... Other Sentry Config (Based on NodeOptions)
  //   },
  //   handleOptions?: {
  //     handleUnknownRoutes: boolean (default: false)
  //   },
  //   enableInDevMode?: boolean (default: false)
  // }
)

export const handle = onHandle(({ event, resolve }) => {
  // Your Handle Code
})

export const handleError = onError((e) => {
  // Your Error Handler
})
```

## Configure Source Map (Optional)

Use [@sentry/vite-plugin](https://npmjs.com/package/@sentry/vite-plugin).

### Example

```js
// vite.config.js
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: true
  },
  plugins: [
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN
    }),
    sveltekit()
  ]
})
```

<!----- BEGIN GHOST DOCS FOOTER ----->

## License

MIT

<!----- END GHOST DOCS FOOTER ----->
