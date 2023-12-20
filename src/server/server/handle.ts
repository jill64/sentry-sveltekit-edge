import type { Span } from '@sentry/core'
import {
  captureException,
  getActiveTransaction,
  getCurrentScope,
  runWithAsyncContext,
  startSpan
} from '@sentry/core'
import {
  dynamicSamplingContextToSentryBaggageHeader,
  objectify
} from '@sentry/utils'
import type { Handle, ResolveOptions } from '@sveltejs/kit'

import { isHttpError, isRedirect } from '@sentry-sveltekit/common/utils.js'
import { getTracePropagationData } from './utils.js'

export type SentryHandleOptions = {
  handleUnknownRoutes?: boolean
}

function sendErrorToSentry(e: unknown): unknown {
  const objectifiedErr = objectify(e)

  if (
    isRedirect(objectifiedErr) ||
    (isHttpError(objectifiedErr) &&
      objectifiedErr.status < 500 &&
      objectifiedErr.status >= 400)
  ) {
    return objectifiedErr
  }

  captureException(objectifiedErr, {
    mechanism: {
      type: 'sveltekit',
      handled: false,
      data: {
        function: 'handle'
      }
    }
  })

  return objectifiedErr
}

const FETCH_PROXY_SCRIPT = `
    const f = window.fetch;
    if(f){
      window._sentryFetchProxy = function(...a){return f(...a)}
      window.fetch = function(...a){return window._sentryFetchProxy(...a)}
    }
`

export const transformPageChunk: NonNullable<
  ResolveOptions['transformPageChunk']
> = ({ html }) => {
  const transaction = getActiveTransaction()
  if (transaction) {
    const traceparentData = transaction.toTraceparent()
    const dynamicSamplingContext = dynamicSamplingContextToSentryBaggageHeader(
      transaction.getDynamicSamplingContext()
    )
    const content = `<head>
  <meta name="sentry-trace" content="${traceparentData}"/>
  <meta name="baggage" content="${dynamicSamplingContext}"/>
  <script>${FETCH_PROXY_SCRIPT}
  </script>
  `
    return html.replace('<head>', content)
  }

  return html
}

export function sentryHandle(handlerOptions?: SentryHandleOptions): Handle {
  const options = {
    handleUnknownRoutes: false,
    ...handlerOptions
  }

  const sentryRequestHandler: Handle = (input) => {
    if (getCurrentScope().getSpan()) {
      return instrumentHandle(input, options)
    }
    return runWithAsyncContext(() => {
      return instrumentHandle(input, options)
    })
  }

  return sentryRequestHandler
}

async function instrumentHandle(
  { event, resolve }: Parameters<Handle>[0],
  options: SentryHandleOptions
): Promise<Response> {
  if (!event.route?.id && !options.handleUnknownRoutes) {
    return resolve(event)
  }

  const { dynamicSamplingContext, traceparentData, propagationContext } =
    getTracePropagationData(event)
  
  getCurrentScope().setPropagationContext(propagationContext)

  try {
    const resolveResult = await startSpan(
      {
        op: 'http.server',
        origin: 'auto.http.sveltekit',
        name: `${event.request.method} ${
          event.route?.id || event.url.pathname
        }`,
        status: 'ok',
        ...traceparentData,
        metadata: {
          source: event.route?.id ? 'route' : 'url',
          dynamicSamplingContext:
            traceparentData && !dynamicSamplingContext
              ? {}
              : dynamicSamplingContext
        }
      },
      async (span?: Span) => {
        const res = await resolve(event, { transformPageChunk })
        if (span) {
          span.setHttpStatus(res.status)
        }
        return res
      }
    )
    return resolveResult
  } catch (e: unknown) {
    sendErrorToSentry(e)
    throw e
  }
}
