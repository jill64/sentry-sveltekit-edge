import type { NodeOptions } from '@sentry-sveltekit/index.server.js'
import type { DevOptions } from '../../types/DevOptions.js'
import type { SentryHandleOptions } from './SentryHandleOptions.js'

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
