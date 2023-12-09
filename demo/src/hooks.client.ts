import { clientInit } from '$dist'
import { errorForTesting } from './tesingErrors'

const onError = clientInit(
  'https://66e05c5ea6c42d35a76741e9420abcfb@o4505814639312896.ingest.sentry.io/4506235746516992',
  {
    sentryOptions: {
      beforeSend: (event) =>
        errorForTesting.includes(event.exception?.values?.[0].value ?? '')
          ? null
          : event
    }
  }
)

export const handleError = onError((_, sentryEventId) => ({
  message: 'This error was successfully sent to Sentry',
  sentryEventId
}))
