<!----- BEGIN GHOST DOCS HEADER ----->
<!----- END GHOST DOCS HEADER ----->

> [!INFO]
> If running on `cloudflare pages`, use instead [`@jill64/sentry-sveltekit-cloudflare`](https://github.com/jill64/sentry-sveltekit-cloudflare).

## Confirmed Adapters

- `adapter-vercel`
- `adapter-netlify`
- `adapter-cloudflare`

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
import { clientInit } from '@jill64/sentry-sveltekit-edge'

const onError = clientInit(
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
import { serverInit } from '@jill64/sentry-sveltekit-edge'

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
