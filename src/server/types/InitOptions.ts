import type { NodeOptions } from '../../sentry-javascript/packages/node/src/types.js'
import type { DevOptions } from '../../types/DevOptions.js'
import type { SentryHandleOptions } from '../server/handle.js'

export type InitOptions = DevOptions & {
  /**
   * Sentry Options
   */
  sentryOptions?: NodeOptions
  /**
   * Sentry Handle Options
   */
  handleOptions?: SentryHandleOptions
}
