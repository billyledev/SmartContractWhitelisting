// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Whitelist is Ownable {
  bytes32 public merkleRoot;

  constructor(bytes32 _merkleRoot) {
    merkleRoot = _merkleRoot;
  }

  function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
    merkleRoot = _merkleRoot;
  }

  function onlyWhitelisted(bytes32[] calldata _proof) external view {
    require(isWhitelisted(msg.sender, _proof), "You are not on the whitelist.");
  }

  function isWhitelisted(address account, bytes32[] calldata proof) internal view returns (bool) {
    return _verify(_leaf(account), proof);
  }

  function _leaf(address account) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(account));
  }

  function _verify(bytes32 leaf, bytes32[] memory proof) internal view returns (bool) {
    return MerkleProof.verify(proof, merkleRoot, leaf);
  }
}
