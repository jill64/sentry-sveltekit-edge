import { createTransport } from '@sentry/core'
import type { NodeTransportOptions } from '@sentry/node/types/transports'
import type {
  Transport,
  TransportMakeRequestResponse,
  TransportRequest
} from '@sentry/types'

export function makeNodeTransport(options: NodeTransportOptions): Transport {
  const { headers = {}, url } = options

  const requestExecutor = async (
    request: TransportRequest
  ): Promise<TransportMakeRequestResponse> => {
    const res = await fetch(url, {
      method: 'POST',
      body: request.body,
      headers
    })

    const retryAfterHeader = res.headers.get('retry-after')
    const rateLimitsHeader = res.headers.get('x-sentry-rate-limits')

    return {
      statusCode: res.status,
      headers: {
        'retry-after': retryAfterHeader,
        'x-sentry-rate-limits': rateLimitsHeader
      }
    }
  }

  return createTransport(options, requestExecutor)
}
