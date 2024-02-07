import { applySdkMetadata, getCurrentScope } from '@sentry/core'
import type { NodeOptions } from '@sentry/node'
import { init as initNodeSdk } from './node/index.js'

export function init(options: NodeOptions): void {
  applySdkMetadata(options, 'sveltekit', ['sveltekit', 'node'])

  initNodeSdk(options)

  getCurrentScope().setTag('runtime', 'node')
}
