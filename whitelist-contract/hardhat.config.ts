import type { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-gas-reporter'

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  gasReporter: {
    enabled: (process.env.REPORT_GAS === 'true') ? true : false
  }
}

export default config
