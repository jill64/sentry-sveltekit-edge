import { clientInit } from '$dist/index.js'
import { toast } from '@jill64/svelte-toast'
import { get } from 'svelte/store'

const onError = clientInit(
  'https://66e05c5ea6c42d35a76741e9420abcfb@o4505814639312896.ingest.sentry.io/4506235746516992'
)

export const handleError = onError((e) => {
  console.error(e)
  if (e.error instanceof Error) {
    get(toast).error(e.error.message)
  }
})
