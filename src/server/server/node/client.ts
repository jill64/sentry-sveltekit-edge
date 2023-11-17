import type { ServerRuntimeClientOptions } from '@sentry/core'
import { SDK_VERSION, ServerRuntimeClient } from '@sentry/core'
import type { NodeClientOptions } from '@sentry/node/types/types'

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
    options._metadata = options._metadata || {}
    options._metadata.sdk = options._metadata.sdk || {
      name: 'sentry.javascript.node',
      packages: [
        {
          name: 'npm:@sentry/node',
          version: SDK_VERSION
        }
      ],
      version: SDK_VERSION
    }

    options.transportOptions = {
      ...options.transportOptions
    }

    const clientOptions: ServerRuntimeClientOptions = {
      ...options,
      platform: 'node',
      serverName: options.serverName
    }

    super(clientOptions)
  }
}
