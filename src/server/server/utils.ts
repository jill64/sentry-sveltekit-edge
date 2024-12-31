import { objectify } from '@sentry/core'
import { captureException, flush } from '@sentry/core'
import { isHttpError, isRedirect, type RequestEvent } from '@sveltejs/kit'

/**
 * Takes a request event and extracts traceparent and DSC data
 * from the `sentry-trace` and `baggage` DSC headers.
 *
 * Sets propagation context as a side effect.
 */
export function getTracePropagationData(event: RequestEvent): {
  sentryTrace: string
  baggage: string | null
} {
  const sentryTrace = event.request.headers.get('sentry-trace') || ''
  const baggage = event.request.headers.get('baggage')

  return { sentryTrace, baggage }
}

/** Flush the event queue to ensure that events get sent to Sentry before the response is finished and the lambda ends */
export async function flushIfServerless(): Promise<void> {
  const platformSupportsStreaming = true

  if (!platformSupportsStreaming) {
    try {
      await flush(2000)
    } catch {}
  }
}

/**
 * Extracts a server-side sveltekit error, filters a couple of known errors we don't want to capture
 * and captures the error via `captureException`.
 *
 * @param e error
 *
 * @returns an objectified version of @param e
 */
export function sendErrorToSentry(
  e: unknown,
  handlerFn: 'handle' | 'load' | 'serverRoute'
): object {
  // In case we have a primitive, wrap it in the equivalent wrapper class (string -> String, etc.) so that we can
  // store a seen flag on it.
  const objectifiedErr = objectify(e)

  // The error() helper is commonly used to throw errors in load functions: https://kit.svelte.dev/docs/modules#sveltejs-kit-error
  // If we detect a thrown error that is an instance of HttpError, we don't want to capture 4xx errors as they
  // could be noisy.
  // Also the `redirect(...)` helper is used to redirect users from one page to another. We don't want to capture thrown
  // `Redirect`s as they're not errors but expected behaviour
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
        function: handlerFn
      }
    }
  })

  return objectifiedErr
}
