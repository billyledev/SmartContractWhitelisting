# Smart Contract Whitelisting

Everything you need to setup an address whitelisting in a Solidity smart contract.

<br/>

This repository is divided in two workspaces :  
- A workspace containing an example whitelist contract
- A workspace containing an API that can compute merkle proofs and verify them

<br/>

The whitelist smart contract workspace contains all the Hardhat configurations you need to compile, test and deploy.

<br/>

Built with Hapi, the API is easy to understand and update.  
It also includes a rate limiter to limit attack vectors. You can choose to use either NodeJS process memory or Redis to store the rate limiter data. When using Redis, the rate limiter will switch to memory if the connection to Redis is lost.

<br/>

ESLint is configured in the two workspaces and helps keeping a clean codebase using the Standard Typescript rules.

<br/>

## Project setup

Run `yarn install` at the root of this repository to install all the necessary dependencies.  
You will need to add two `.env` files in the `whitelist-api` and `whitelist-contract` folders. You can find examples in the respective folders under the name `example.env`.  
You will also need to create a `whitelist.json` file on the `whitelist-api` folder. You can find a whitelist example in the `whitelist-api` folder under the name `whitelist-example.json`.

<br/>

## Whitelist contract

### Contract configuration

Update the merkle root value in the `.env` file before deploying the whitelist contract.

### Running ESLint

Run `yarn contract:lint` at the root of this repository to run ESLint on the whitelist contract code.

### Building the contract

Run `yarn contract:compile` at the root of this repository to build the whitelist contract.

### Testing the contract

Run `yarn contract:test` at the root of this repository to run unit tests on the whitelist contract code.

### Checking the tests coverage

Run `yarn contract:coverage` at the root of this repository to run a tests coverage analysis.

<br/>

## Whitelist API

### API configuration

You can update the API server settings in the `.env` file.

### Updating the whitelist

You can add new whitelist entries in the `whitelist.json` by adding the following lines:
```json
{
  "address": "PUBLIC_ADDRESS"
}
```
You will need to replace `PUBLIC_ADDRESS` with the public address of the whitelisted wallet.  
The server needs to be restarted after a whitelist update (which is done automatically when using `yarn api:start`).

### Running ESLint

Run `yarn api:lint` at the root of this repository to run ESLint on the API code.

### Build the API

Run `yarn api:build` at the root of this repository to build the API code.

### Run the API

Run `yarn api:start` at the root of this repository to start the API.

### Getting the merkle root

Run `yarn api:get-merkle-root` at the root of this repository to build a merkle tree and get the merkle root.
