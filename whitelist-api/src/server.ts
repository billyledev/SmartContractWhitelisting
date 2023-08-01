import 'dotenv/config'

import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import HapiPino from 'hapi-pino'

import rateLimiterPlugin from '@/plugins/rateLimiterPlugin'
import merklePlugin from '@/plugins/merklePlugin'

const isProduction = process.env.NODE_ENV === 'production'

const server: Hapi.Server = Hapi.server({
  port: process.env.PORT ?? 3000,
  host: process.env.HOST ?? '0.0.0.0',
  routes: {
    validate: {
      failAction: async (request, h, err) => {
        if (isProduction) {
          console.error('ValidationError:', err?.message)
          throw Boom.badRequest('Invalid input')
        } else {
          console.log(err)
          throw err ?? new Error('Unknown error')
        }
      }
    }
  }
})

export async function createServer (): Promise<Hapi.Server> {
  await server.register({
    plugin: HapiPino,
    options: {
      logEvents: process.env.TEST === 'true' ? false : undefined,
      redact: ['req.headers.authorization'],
      ...(isProduction ? {} : { transport: { target: 'pino-pretty' } })
    }
  })

  await server.register([
    rateLimiterPlugin,
    merklePlugin
  ])
  await server.initialize()

  return server
}

export async function startServer (server: Hapi.Server): Promise<Hapi.Server> {
  await server.start()
  server.log('info', `Server running on ${server.info.uri}`)
  return server
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})
