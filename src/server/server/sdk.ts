import { applySdkMetadata } from '@sentry-sveltekit/common/metadata.js'
import { getCurrentScope } from '@sentry/core'
import { RewriteFrames } from '@sentry/integrations'
import type { NodeOptions } from '@sentry/node/types/index.js'
import { addOrUpdateIntegration } from '@sentry/utils'
import { init as initNodeSdk } from './node/index.js'
import { rewriteFramesIteratee } from './utils.js'

export function init(options: NodeOptions): void {
  applySdkMetadata(options, ['sveltekit', 'node'])

  addServerIntegrations(options)

  initNodeSdk(options)

  getCurrentScope().setTag('runtime', 'node')
}

function addServerIntegrations(options: NodeOptions): void {
  options.integrations = addOrUpdateIntegration(
    new RewriteFrames({ iteratee: rewriteFramesIteratee }),
    options.integrations || []
  )
}
