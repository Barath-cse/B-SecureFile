const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const router = express.Router();

// Sample smart contract ABI (minimal)
const CONTRACT_ABI = [
  'function uploadFile(string memory hash, address owner) public',
  'function verifyFile(string memory hash) public view returns (bool)',
  'function grantAccess(uint256 fileId, address user) public',
  'function hasAccess(uint256 fileId, address user) public view returns (bool)',
  'function getFileDetails(uint256 fileId) public view returns (tuple(string hash, address owner, uint256 timestamp))'
];

// Initialize provider (Ganache or Sepolia)
const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_RPC || 'http://localhost:7545';
const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC);

// Get contract instance
const getContract = () => {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;

  if (!contractAddress || !privateKey) {
    throw new Error('CONTRACT_ADDRESS and PRIVATE_KEY not configured in .env');
  }

  const signer = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
};

// Store file hash on blockchain
router.post('/store-hash', async (req, res) => {
  try {
    const { fileHash, userAddress } = req.body;

    if (!fileHash || !userAddress) {
      return res.status(400).json({ error: 'Missing fileHash or userAddress' });
    }

    const contract = getContract();

    // Call smart contract
    const tx = await contract.uploadFile(fileHash, userAddress);
    const receipt = await tx.wait();

    res.json({
      message: 'Hash stored on blockchain',
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });
  } catch (error) {
    console.error('Store hash error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify hash on blockchain
router.get('/verify-blockchain/:fileHash', async (req, res) => {
  try {
    const { fileHash } = req.params;

    const contract = getContract();
    const isValid = await contract.verifyFile(fileHash);

    res.json({
      fileHash,
      isValid,
      message: isValid ? '✅ Hash found on blockchain' : '❌ Hash not found on blockchain'
    });
  } catch (error) {
    console.error('Verify blockchain error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Grant file access
router.post('/grant-access', async (req, res) => {
  try {
    const { fileId, userAddress } = req.body;

    if (!fileId || !userAddress) {
      return res.status(400).json({ error: 'Missing fileId or userAddress' });
    }

    const contract = getContract();
    const tx = await contract.grantAccess(fileId, userAddress);
    const receipt = await tx.wait();

    res.json({
      message: 'Access granted',
      transactionHash: receipt.hash,
      grantedTo: userAddress
    });
  } catch (error) {
    console.error('Grant access error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check access permission
router.get('/check-access/:fileId/:userAddress', async (req, res) => {
  try {
    const { fileId, userAddress } = req.params;

    const contract = getContract();
    const hasAccess = await contract.hasAccess(fileId, userAddress);

    res.json({
      fileId,
      userAddress,
      hasAccess,
      message: hasAccess ? '✅ User has access' : '❌ User does not have access'
    });
  } catch (error) {
    console.error('Check access error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain network info
router.get('/network-info', async (req, res) => {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    res.json({
      network: network.name,
      chainId: network.chainId,
      blockNumber,
      rpcUrl: BLOCKCHAIN_RPC
    });
  } catch (error) {
    console.error('Network info error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
