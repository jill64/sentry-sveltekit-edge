import type { GlobalWithSentryValues } from '@sentry-sveltekit/vite/injectGlobalValues.js'
import type { StackFrame } from '@sentry/types'
import {
  GLOBAL_OBJ,
  basename,
  escapeStringForRegex,
  join,
  tracingContextFromHeaders
} from '@sentry/utils'
import type { RequestEvent } from '@sveltejs/kit'
import { WRAPPED_MODULE_SUFFIX } from '../vite/autoInstrument.js'

export function getTracePropagationData(
  event: RequestEvent
): ReturnType<typeof tracingContextFromHeaders> {
  const sentryTraceHeader = event.request.headers.get('sentry-trace') || ''
  const baggageHeader = event.request.headers.get('baggage')
  return tracingContextFromHeaders(sentryTraceHeader, baggageHeader)
}

export function rewriteFramesIteratee(frame: StackFrame): StackFrame {
  if (!frame.filename) {
    return frame
  }
  const globalWithSentryValues: GlobalWithSentryValues = GLOBAL_OBJ
  const svelteKitBuildOutDir =
    globalWithSentryValues.__sentry_sveltekit_output_dir
  const prefix = 'app:///'

  // Check if the frame filename begins with `/` or a Windows-style prefix such as `C:\`
  const isWindowsFrame = /^[a-zA-Z]:\\/.test(frame.filename)
  const startsWithSlash = /^\//.test(frame.filename)
  if (isWindowsFrame || startsWithSlash) {
    const filename = isWindowsFrame
      ? frame.filename
          .replace(/^[a-zA-Z]:/, '') // remove Windows-style prefix
          .replace(/\\/g, '/') // replace all `\\` instances with `/`
      : frame.filename

    let strippedFilename
    if (svelteKitBuildOutDir) {
      strippedFilename = filename.replace(
        new RegExp(
          `^.*${escapeStringForRegex(join(svelteKitBuildOutDir, 'server'))}/`
        ),
        ''
      )
    } else {
      strippedFilename = basename(filename)
    }
    frame.filename = `${prefix}${strippedFilename}`
  }

  delete frame.module

  if (frame.filename.endsWith(WRAPPED_MODULE_SUFFIX)) {
    frame.filename = frame.filename.slice(0, -WRAPPED_MODULE_SUFFIX.length)
  }

  return frame
}
