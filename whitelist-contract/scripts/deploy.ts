import { ethers } from 'hardhat'
import 'dotenv/config'

const provider = ethers.provider

const { MERKLE_ROOT } = process.env

async function main (): Promise<void> {
  const [deployer] = await ethers.getSigners()

  console.log(`Deploying contracts with the account: ${deployer.address}`)
  console.log(`Account balance: ${(await provider.getBalance(deployer)).toString()}`)

  const Whitelist = await ethers.getContractFactory('Whitelist')
  const whitelist = await Whitelist.deploy(MERKLE_ROOT)

  console.log(`Contract deployed to address: ${await whitelist.getAddress()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
