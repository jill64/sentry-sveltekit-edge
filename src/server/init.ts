import { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import * as Sentry from './server/index.js'
import { HandleWrappers } from './types/HandleWrappers.js'
import { InitOptions } from './types/InitOptions.js'

export const init = (
  /**
   * Sentry DSN
   * @see https://docs.sentry.io/product/sentry-basics/dsn-explainer/
   */
  dsn: string,
  /**
   * Server Init Options
   */
  options?: InitOptions
): HandleWrappers => {
  const { sentryOptions, handleOptions } = options ?? {}

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
