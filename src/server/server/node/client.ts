import type { ServerRuntimeClientOptions } from '@sentry/core'
import { ServerRuntimeClient, applySdkMetadata } from '@sentry/core'
import type { NodeClientOptions } from '@sentry/node/types/types.js'

/**
 * The Sentry Node SDK Client.
 *
 * @see NodeClientOptions for documentation on configuration options.
 * @see SentryClient for usage documentation.
 */
export class NodeClient extends ServerRuntimeClient<NodeClientOptions> {
  /**
   * Creates a new Node SDK instance.
   * @param options Configuration options for this SDK.
   */
  public constructor(options: NodeClientOptions) {
    applySdkMetadata(options, 'node')

    // Until node supports global TextEncoder in all versions we support, we are forced to pass it from util
    options.transportOptions = {
      ...options.transportOptions
    }

    const clientOptions: ServerRuntimeClientOptions = {
      ...options,
      platform: 'node',
      runtime: { name: 'node', version: global.process.version },
      serverName: options.serverName || global.process.env.SENTRY_NAME
    }

    super(clientOptions)
  }
}
