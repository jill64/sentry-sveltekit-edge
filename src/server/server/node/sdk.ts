import { diag, DiagLogLevel } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base'
import { defaultStackParser } from '@sentry-sveltekit/index.client.js'
import {
  _optionalChain,
  consoleSandbox,
  dropUndefinedKeys,
  getCurrentScope,
  getIntegrationsToSetup,
  GLOBAL_OBJ,
  logger,
  SDK_VERSION,
  stackParserFromStackParserOptions
} from '@sentry/core'
import { type NodeOptions } from '@sentry/node'
import {
  enhanceDscWithOpenTelemetryRootSpanName,
  SentryPropagator,
  SentrySampler,
  SentrySpanProcessor,
  setOpenTelemetryContextAsyncContextStrategy,
  setupEventContextTrace
} from '@sentry/opentelemetry'
import {
  EsmLoaderHookOptions,
  NodeClientOptions
} from '../../../sentry-javascript/packages/node/src/types.js'
import { NodeClient } from './client.js'
import { makeNodeTransport } from './transports/http.js'

/** Detect CommonJS. */
function isCjs() {
  return typeof require !== 'undefined'
}

function getRegisterOptions(esmHookConfig?: EsmLoaderHookOptions) {
  // TODO(v9): Make onlyIncludeInstrumentedModules: true the default behavior.
  if (
    _optionalChain([
      esmHookConfig,
      'optionalAccess',
      (_: EsmLoaderHookOptions) => _.onlyIncludeInstrumentedModules
    ])
  ) {
    // TODO: This is a temporary workaround until we have a better solution for this.
    // const { addHookMessagePort } = createAddHookMessageChannel()
    const addHookMessagePort = null

    // If the user supplied include, we need to use that as a starting point or use an empty array to ensure no modules
    // are wrapped if they are not hooked
    return {
      data: { addHookMessagePort, include: esmHookConfig?.include || [] },
      transferList: [addHookMessagePort]
    }
  }

  return { data: esmHookConfig }
}

/** Initialize the ESM loader. */
function maybeInitializeEsmLoader(esmHookConfig?: EsmLoaderHookOptions) {
  const [nodeMajor = 0, nodeMinor = 0] = process.versions.node
    .split('.')
    .map(Number)

  // Register hook was added in v20.6.0 and v18.19.0
  if (
    nodeMajor >= 22 ||
    (nodeMajor === 20 && nodeMinor >= 6) ||
    (nodeMajor === 18 && nodeMinor >= 19)
  ) {
    // We need to work around using import.meta.url directly because jest complains about it.
    const importMetaUrl =
      typeof import.meta.url !== 'undefined' ? import.meta.url : undefined

    if (!GLOBAL_OBJ._sentryEsmLoaderHookRegistered && importMetaUrl) {
      try {
        // @ts-expect-error register is available in these versions
        moduleModule.register(
          'import-in-the-middle/hook.mjs',
          importMetaUrl,
          getRegisterOptions(esmHookConfig)
        )
        GLOBAL_OBJ._sentryEsmLoaderHookRegistered = true
      } catch (error) {
        logger.warn('Failed to register ESM hook', error)
      }
    }
  } else {
    consoleSandbox(() => {
      console.warn(
        '[Sentry] You are using Node.js in ESM mode ("import syntax"). The Sentry Node.js SDK is not compatible with ESM in Node.js versions before 18.19.0 or before 20.6.0. Please either build your application with CommonJS ("require() syntax"), or upgrade your Node.js version.'
      )
    })
  }
}

/**
 * Setup the OTEL logger to use our own logger.
 */
function setupOpenTelemetryLogger() {
  const otelLogger = new Proxy(logger, {
    get(target, prop, receiver) {
      const actualProp = prop === 'verbose' ? 'debug' : prop
      return Reflect.get(target, actualProp, receiver)
    }
  })

  // Disable diag, to ensure this works even if called multiple times
  diag.disable()
  // @ts-expect-error diag is not typed
  diag.setLogger(otelLogger, DiagLogLevel.DEBUG)
}

/**
 * Initialize OpenTelemetry for Node.
 */
function initOpenTelemetry(client: NodeClient) {
  if (client.getOptions().debug) {
    setupOpenTelemetryLogger()
  }

  const provider = setupOtel(client)
  // @ts-expect-error `traceProvider` is not part of the NodeClient
  client.traceProvider = provider
}

const ATTR_SERVICE_NAME = 'service.name'
const ATTR_SERVICE_VERSION = 'service.version'
const SEMRESATTRS_SERVICE_NAMESPACE = 'service.namespace'
const DEBUG_BUILD = false
// About 277h - this must fit into new Array(len)!
const MAX_MAX_SPAN_WAIT_DURATION = 1000000

/** Just exported for tests. */
function _clampSpanProcessorTimeout(maxSpanWaitDuration?: number) {
  if (maxSpanWaitDuration == null) {
    return undefined
  }

  // We guard for a max. value here, because we create an array with this length
  // So if this value is too large, this would fail
  if (maxSpanWaitDuration > MAX_MAX_SPAN_WAIT_DURATION) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    DEBUG_BUILD &&
      logger.warn(
        `\`maxSpanWaitDuration\` is too high, using the maximum value of ${MAX_MAX_SPAN_WAIT_DURATION}`
      )
    return MAX_MAX_SPAN_WAIT_DURATION
  } else if (maxSpanWaitDuration <= 0 || Number.isNaN(maxSpanWaitDuration)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    DEBUG_BUILD &&
      logger.warn(
        '`maxSpanWaitDuration` must be a positive number, using default value instead.'
      )
    return undefined
  }

  return maxSpanWaitDuration
}

/** Just exported for tests. */
function setupOtel(client: NodeClient) {
  // Create and configure NodeTracerProvider
  const provider = new BasicTracerProvider({
    sampler: new SentrySampler(client),
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'node',
      [SEMRESATTRS_SERVICE_NAMESPACE]: 'sentry',
      [ATTR_SERVICE_VERSION]: SDK_VERSION
    }),
    forceFlushTimeoutMillis: 500,
    spanProcessors: [
      new SentrySpanProcessor({
        timeout: _clampSpanProcessorTimeout(
          client.getOptions().maxSpanWaitDuration
        )
      })
    ]
  })

  // Initialize the provider
  provider.register({
    propagator: new SentryPropagator(),
    // TODO: Add context manager
    contextManager: null
    // contextManager: new SentryContextManager()
  })

  return provider
}

export function init(ops: NodeOptions = {}) {
  const options = getClientOptions(ops)

  if (options.debug === true) {
    // use `console.warn` rather than `logger.warn` since by non-debug bundles have all `logger.x` statements stripped
    consoleSandbox(() => {
      console.warn(
        '[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.'
      )
    })
  }

  if (!isCjs() && options.registerEsmLoaderHooks !== false) {
    maybeInitializeEsmLoader(
      options.registerEsmLoaderHooks === true
        ? undefined
        : options.registerEsmLoaderHooks
    )
  }

  setOpenTelemetryContextAsyncContextStrategy()

  const scope = getCurrentScope()
  scope.update(options.initialScope)

  const client = new NodeClient(options)
  // The client is on the current scope, from where it generally is inherited
  getCurrentScope().setClient(client)

  client.init()

  logger.log(`Running in ${isCjs() ? 'CommonJS' : 'ESM'} mode.`)

  // If users opt-out of this, they _have_ to set up OpenTelemetry themselves
  // There is no way to use this SDK without OpenTelemetry!
  if (!options.skipOpenTelemetrySetup) {
    initOpenTelemetry(client)
  }

  enhanceDscWithOpenTelemetryRootSpanName(client)
  setupEventContextTrace(client)

  return client
}

function getClientOptions(options: NodeOptions): NodeClientOptions {
  const release = getRelease(options.release)

  const autoSessionTracking =
    typeof release !== 'string'
      ? false
      : options.autoSessionTracking === undefined
        ? true
        : options.autoSessionTracking

  const tracesSampleRate = getTracesSampleRate(options.tracesSampleRate)

  const baseOptions = dropUndefinedKeys({
    transport: makeNodeTransport,
    dsn: options.dsn,
    environment: null,
    // TODO: Add `environment` to the NodeOptions
    // environment: process.env.SENTRY_ENVIRONMENT,
    sendClientReports: true
  })

  const overwriteOptions = dropUndefinedKeys({
    release,
    autoSessionTracking,
    tracesSampleRate
  })

  const mergedOptions = {
    ...baseOptions,
    ...options,
    ...overwriteOptions
  }

  // @ts-expect-error `integrations` is not part of the NodeOptions
  const clientOptions: NodeClientOptions = {
    ...mergedOptions,
    stackParser: stackParserFromStackParserOptions(
      options.stackParser || defaultStackParser
    ),
    integrations: getIntegrationsToSetup({
      defaultIntegrations: options.defaultIntegrations,
      integrations: options.integrations
    })
  }

  return clientOptions
}

function getRelease(release: NodeOptions['release']) {
  if (release !== undefined) {
    return release
  }

  const detectedRelease = getSentryRelease()
  if (detectedRelease !== undefined) {
    return detectedRelease
  }

  return undefined
}

/**
 * Returns a release dynamically from environment variables.
 */
function getSentryRelease(fallback?: unknown) {
  // This supports the variable that sentry-webpack-plugin injects
  if (GLOBAL_OBJ.SENTRY_RELEASE && GLOBAL_OBJ.SENTRY_RELEASE.id) {
    return GLOBAL_OBJ.SENTRY_RELEASE.id
  }

  return fallback
}

function getTracesSampleRate(
  tracesSampleRate: NodeOptions['tracesSampleRate']
): number | undefined {
  if (tracesSampleRate !== undefined) {
    return tracesSampleRate
  }

  return undefined
}
