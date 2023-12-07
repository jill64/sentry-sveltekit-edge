import { clientInit } from '$dist'

const onError = clientInit(
  'https://66e05c5ea6c42d35a76741e9420abcfb@o4505814639312896.ingest.sentry.io/4506235746516992'
)

export const handleError = onError((e, sentryEventId) => {
  console.error(e)

  return {
    message: 'This error was successfully sent to Sentry',
    sentryEventId
  }
})
