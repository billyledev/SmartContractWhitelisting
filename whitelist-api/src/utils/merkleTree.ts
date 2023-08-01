import fs from 'fs'
import path from 'path'

import MerkleTree from 'merkletreejs'
import { keccak256 } from 'ethers'

interface WhitelistEntry {
  address: string
}

const WHITELIST_PATH = path.resolve('whitelist.json')

const whitelistData = fs.existsSync(WHITELIST_PATH) ? fs.readFileSync(WHITELIST_PATH).toString() : '[]'
const whitelist: WhitelistEntry[] = JSON.parse(whitelistData)
const addresses: string[] = whitelist.map((entry) => entry.address)
const leaves = addresses.map((address) => keccak256(address))

const tree = new MerkleTree(leaves, keccak256, { sort: true })

export default tree
