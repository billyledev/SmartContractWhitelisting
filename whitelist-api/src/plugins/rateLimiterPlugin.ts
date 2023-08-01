import Redis from 'ioredis'

import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible'
import type { IRateLimiterRes } from 'rate-limiter-flexible'

import type Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'

const { USE_REDIS, REDIS_HOST, REDIS_PORT } = process.env

interface RateLimiterPluginData {
  pluginName: string
  redisClient?: Redis
  rateLimiter?: RateLimiterMemory | RateLimiterRedis
}

const internals: RateLimiterPluginData = {
  pluginName: 'app/rateLimiter'
}

const baseRateConfig = {
  points: 6, // 6 requests
  duration: 60 // per 60 second by IP
}

const rateLimiterMemory = new RateLimiterMemory(baseRateConfig)

if (USE_REDIS === 'false') {
  internals.rateLimiter = rateLimiterMemory
} else {
  internals.redisClient = new Redis({
    host: REDIS_HOST ?? 'localhost',
    port: parseInt(REDIS_PORT ?? '6379'),
    enableOfflineQueue: false
  })

  internals.rateLimiter = new RateLimiterRedis({
    storeClient: internals.redisClient,
    keyPrefix: 'rate-limiter',
    ...baseRateConfig,
    insuranceLimiter: rateLimiterMemory
  })
}

const rateLimiterPlugin = {
  name: internals.pluginName,
  version: '1.0.0',
  register: function (server: Hapi.Server) {
    server.ext('onPreAuth', async (request, h) => {
      try {
        await internals.rateLimiter?.consume(request.info.remoteAddress)
        return h.continue
      } catch (rej) {
        let error
        if (rej instanceof Error) {
          // If some Redis error and insuranceLimiter is not set
          error = Boom.internal()
        } else {
          // Not enough points to consume
          const rateLimitError = rej as IRateLimiterRes
          error = Boom.tooManyRequests('Rate limit exceeded')
          error.output.headers['Retry-After'] = Math.round((rateLimitError?.msBeforeNext ?? 1000) / 1000)
        }
        return error
      }
    })
  }
}

export default rateLimiterPlugin
