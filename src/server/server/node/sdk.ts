import {
  getIntegrationsToSetup,
  getMainCarrier,
  initAndBind
} from '@sentry/core'
import type { NodeClientOptions } from '@sentry/node/types/types'
import type { NodeOptions } from '@sentry/sveltekit'
import type { StackParser } from '@sentry/types'
import {
  createStackParser,
  nodeStackLineParser,
  stackParserFromStackParserOptions
} from '@sentry/utils'

import { NodeClient } from './client'
import { makeNodeTransport } from './transports'

export function init(options: NodeOptions = {}): void {
  const carrier = getMainCarrier()

  const autoloadedIntegrations = carrier.__SENTRY__?.integrations || []

  options.defaultIntegrations =
    options.defaultIntegrations === false
      ? []
      : [...(options.defaultIntegrations ?? []), ...autoloadedIntegrations]

  options.autoSessionTracking = false

  if (options.instrumenter === undefined) {
    options.instrumenter = 'sentry'
  }

  const clientOptions: NodeClientOptions = {
    ...options,
    stackParser: stackParserFromStackParserOptions(
      options.stackParser || defaultStackParser
    ),
    integrations: getIntegrationsToSetup(options),
    transport: options.transport || makeNodeTransport
  }

  initAndBind(options.clientClass || NodeClient, clientOptions)
}

const defaultStackParser: StackParser = createStackParser(
  nodeStackLineParser((x) => x)
)
