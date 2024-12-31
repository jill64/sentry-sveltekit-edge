import { applySdkMetadata } from '@sentry/core'
import type { NodeOptions } from '@sentry/node'
import { init as initNodeSdk } from './node/index.js'

export function init(options: NodeOptions) {
  applySdkMetadata(options, 'sveltekit', ['sveltekit', 'node'])

  return initNodeSdk(options)
}
