import { keccak256 } from 'ethers'

import type Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

import tree from '@/utils/merkleTree'

interface VerifyPayload {
  proof: string[]
}

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
const HASH_REGEX = /^0x[a-f0-9]{64}$/

const merklePlugin = {
  name: 'app/merkle',
  dependencies: [],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'GET',
        path: '/merkle/proof/{address}',
        handler: proofHandler,
        options: {
          validate: {
            params: Joi.object({
              address: Joi.string().regex(ADDRESS_REGEX)
            })
          }
        }
      },
      {
        method: 'POST',
        path: '/merkle/verify/{address}',
        handler: verifyHandler,
        options: {
          validate: {
            params: Joi.object({
              address: Joi.string().regex(ADDRESS_REGEX)
            }),
            payload: Joi.object({
              proof: Joi.array().items(Joi.string().regex(HASH_REGEX))
            })
          }
        }
      }
    ])
  }
}

async function proofHandler (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject | Boom.Boom> {
  const { address } = request.params

  const proof = tree.getHexProof(keccak256(address))

  if (proof.length === 0) {
    return Boom.notFound('Not in whitelist')
  }

  return h.response(proof).code(StatusCodes.OK)
}

async function verifyHandler (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> {
  const { address } = request.params
  const { proof } = request.payload as VerifyPayload

  const verification = tree.verify(proof, keccak256(address), tree.getHexRoot())

  return h.response({ valid: verification }).code(StatusCodes.OK)
}

export default merklePlugin
