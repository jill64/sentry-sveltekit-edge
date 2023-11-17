import { serverInit } from '$dist/index.js'

const { onHandle, onError } = serverInit(
  'https://66e05c5ea6c42d35a76741e9420abcfb@o4505814639312896.ingest.sentry.io/4506235746516992'
)

export const handle = onHandle()
export const handleError = onError()
