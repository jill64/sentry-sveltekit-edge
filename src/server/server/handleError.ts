import { captureException } from '@sentry/core'
import type { HandleServerError } from '@sveltejs/kit'
import type { Captured } from '../../types/Captured.js'
import { defaultErrorHandler } from '../util/defaultErrorHandler.js'
import { isNotFoundError } from '../util/isNotFoundError.js'

export const handleErrorWithSentry: Captured<HandleServerError> =
  (handleError = defaultErrorHandler) =>
  (input) => {
    if (isNotFoundError(input)) {
      return handleError(input)
    }

    const result = captureException(input.error, {
      mechanism: {
        type: 'sveltekit',
        handled: false
      }
    })

    return handleError(input, result)
  }
