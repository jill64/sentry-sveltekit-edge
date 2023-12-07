import type { DevOptions } from '../../common/types/DevOptions.js'
import type { SentryHandleOptions } from './SentryHandleOptions.js'
import type { NodeOptions } from '@sentry/sveltekit'

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
