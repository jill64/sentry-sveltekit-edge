import type { NodeOptions } from '@sentry/node/types/index.js'
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
