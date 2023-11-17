import { dev } from '$app/environment'
import type { NodeOptions } from '@sentry/sveltekit'
import type { SentryHandleOptions } from '@sentry/sveltekit/types/server/handle.js'
import { Handle, HandleServerError } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import * as Sentry from './server'

export const init = (
  /**
   * Sentry DSN
   * @see https://docs.sentry.io/product/sentry-basics/dsn-explainer/
   */
  dsn: string,
  /**
   * Server Init Options
   */
  options?: {
    /**
     * Sentry Options
     */
    sentryOptions?: NodeOptions
    /**
     * Sentry Handle Options
     */
    handleOptions?: SentryHandleOptions
    /**
     * Enable in dev mode
     * @default false
     */
    enableInDevMode?: boolean
  }
) => {
  const { enableInDevMode, sentryOptions, handleOptions } = options ?? {}

  if (dev && !enableInDevMode) {
    return {
      onHandle: (handle?: Handle) => handle,
      onError: (handleError?: HandleServerError) => handleError
    }
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    ...sentryOptions
  })

  const sentryHandle = Sentry.sentryHandle(handleOptions)

  return {
    onHandle: (handle?: Handle) =>
      handle ? sequence(sentryHandle, handle) : sentryHandle,
    onError: Sentry.handleErrorWithSentry
  }
}
