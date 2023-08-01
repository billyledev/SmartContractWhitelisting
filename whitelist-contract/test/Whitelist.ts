import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { MerkleTree } from 'merkletreejs'
import { keccak256 } from 'ethers'
import { expect } from 'chai'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import type { Whitelist } from '../typechain-types'

interface FixtureData {
  whitelist: Whitelist
  tree: MerkleTree
  owner: HardhatEthersSigner
  otherAccount: HardhatEthersSigner
  inWhitelist: HardhatEthersSigner
  inWhitelistProof: string[]
  notInWhitelist: HardhatEthersSigner
  notInWhitelistProof: string[]
}

describe('Whitelist', function () {
  async function deployWhitelistFixture (): Promise<FixtureData> {
    const [owner, otherAccount, inWhitelist, notInWhitelist] = await ethers.getSigners()

    const tab = [
      owner.address,
      inWhitelist.address
    ]
    const leaves = tab.map((address) => keccak256(address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const root = tree.getHexRoot()
    const inWhitelistProof = tree.getHexProof(keccak256(inWhitelist.address))
    const notInWhitelistProof = tree.getHexProof(keccak256(notInWhitelist.address))

    const Whitelist = await ethers.getContractFactory('Whitelist')
    const whitelist = await Whitelist.deploy(ethers.getBytes(root))

    return {
      whitelist,
      tree,
      owner,
      otherAccount,
      inWhitelist,
      inWhitelistProof,
      notInWhitelist,
      notInWhitelistProof
    }
  }

  describe('Data updates', function () {
    it('Should update the merkle root', async function () {
      const newRoot = ethers.getBytes('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
      const { whitelist, owner } = await loadFixture(deployWhitelistFixture)

      expect(ethers.getBytes(await whitelist.merkleRoot())).to.not.deep.equal(newRoot)
      await whitelist.connect(owner).setMerkleRoot(newRoot)
      expect(ethers.getBytes(await whitelist.merkleRoot())).to.deep.equal(newRoot)
    })

    it('Should only allow the owner to update the merkle root', async function () {
      const newRoot = ethers.getBytes('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
      const { whitelist, owner, otherAccount } = await loadFixture(deployWhitelistFixture)

      expect(ethers.getBytes(await whitelist.merkleRoot())).to.not.deep.equal(newRoot)
      await expect(whitelist.connect(otherAccount).setMerkleRoot(newRoot))
        .to.be.rejectedWith('Ownable: caller is not the owner')
      expect(ethers.getBytes(await whitelist.merkleRoot())).to.not.deep.equal(newRoot)
      await whitelist.connect(owner).setMerkleRoot(newRoot)
      expect(ethers.getBytes(await whitelist.merkleRoot())).to.deep.equal(newRoot)
    })
  })

  describe('Whitelist', function () {
    it('Should only allow people on the whitelist', async function () {
      const {
        whitelist,
        inWhitelist,
        inWhitelistProof,
        notInWhitelist,
        notInWhitelistProof
      } = await loadFixture(deployWhitelistFixture)

      await expect(whitelist.connect(inWhitelist).onlyWhitelisted(inWhitelistProof))
        .to.not.be.rejectedWith('You are not on the whitelist.')

      await expect(whitelist.connect(notInWhitelist).onlyWhitelisted(notInWhitelistProof))
        .to.be.rejectedWith('You are not on the whitelist.')
    })

    it('Should only allow people with their own proof', async function () {
      const {
        whitelist,
        notInWhitelist,
        inWhitelistProof
      } = await loadFixture(deployWhitelistFixture)

      await expect(whitelist.connect(notInWhitelist).onlyWhitelisted(inWhitelistProof))
        .to.be.rejectedWith('You are not on the whitelist.')
    })
  })
})
