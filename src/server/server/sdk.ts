import { configureScope } from '@sentry/core'
import { RewriteFrames } from '@sentry/integrations'
import type { NodeOptions } from '@sentry-sveltekit/index.server.js'
import { addOrUpdateIntegration } from '@sentry/utils'
import { applySdkMetadata } from '@sentry-sveltekit/common/metadata.js'
import { init as initNodeSdk } from './node/index.js'
import { rewriteFramesIteratee } from './utils.js'

/**
 *
 * @param options
 */
export function init(options: NodeOptions): void {
  applySdkMetadata(options, ['sveltekit', 'node'])

  addServerIntegrations(options)

  initNodeSdk(options)

  configureScope((scope) => {
    scope.setTag('runtime', 'node')
  })
}

function addServerIntegrations(options: NodeOptions): void {
  options.integrations = addOrUpdateIntegration(
    new RewriteFrames({ iteratee: rewriteFramesIteratee }),
    options.integrations || []
  )
}
