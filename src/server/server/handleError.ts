import { captureException } from '@sentry/core'
import { addExceptionMechanism } from '@sentry/utils'
import type { HandleServerError } from '@sveltejs/kit'
import { Captured } from '../../common/types/Captured.js'
import { defaultErrorHandler } from '../util/defaultErrorHandler.js'
import { isNotFoundError } from '../util/isNotFoundError.js'

export const handleErrorWithSentry: Captured<HandleServerError> =
  (handleError = defaultErrorHandler) =>
  (input) => {
    if (isNotFoundError(input)) {
      return handleError(input)
    }

    const result = captureException(input.error, (scope) => {
      scope.addEventProcessor((event) => {
        addExceptionMechanism(event, {
          type: 'sveltekit',
          handled: false
        })
        return event
      })
      return scope
    })

    return handleError(input, result)
  }
