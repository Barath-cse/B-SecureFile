# Getting Started with BlockSecure

This guide covers installation, configuration, and initial testing of BlockSecure.

---

## Prerequisites

Before starting, ensure you have:
- **Node.js** v16 or higher ([download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MetaMask** browser extension ([install](https://metamask.io/))
- **Git** for version control
- A code editor (VS Code recommended)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd B-SecureFile
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

## Configuration

### Step 1: Set Up Local Blockchain

**Option A: Using Ganache (Recommended for Local Development)**

1. Install Ganache: https://www.trufflesuite.com/ganache
2. Launch Ganache and note the RPC URL (default: `http://127.0.0.1:7545`)
3. Import Ganache accounts into MetaMask:
   - Copy mnemonic from Ganache
   - In MetaMask, go to Settings → Import Account → Enter mnemonic
4. Switch MetaMask to "Ganache" custom network

**Option B: Using Sepolia Testnet**

1. Switch MetaMask to Sepolia testnet
2. Get testnet ETH from faucet: https://sepoliafaucet.com
3. Note RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`

### Step 2: Deploy Smart Contract

1. Open Remix IDE: https://remix.ethereum.org
2. Create new file: `FileSecure.sol`
3. Copy contract code from `contracts/FileSecure.sol`
4. Compile using Solidity ^0.8.0
5. Deploy to Ganache or Sepolia via MetaMask
6. **Copy the contract address** (you'll need this)

### Step 3: Configure Backend

Create `.env` file in `backend/`:

```ini
PORT=5000
BLOCKCHAIN_RPC=http://127.0.0.1:7545
CONTRACT_ADDRESS=0xYourContractAddressFromAbove
PRIVATE_KEY=your_ganache_account_private_key
```

For Sepolia:
```ini
PORT=5000
BLOCKCHAIN_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0xYourDeployedContractAddress
PRIVATE_KEY=your_metamask_private_key
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
✅ Connected to blockchain
✅ Contract loaded at 0x...
```

### Start Frontend Application

Open another terminal:

```bash
cd frontend
npm start
```

This opens http://localhost:3000 in your browser automatically.

---

## Quick Start Testing Checklist

Follow this checklist to verify all functionality works:

### 1. **Wallet Connection** ✓
- [ ] Open BlockSecure at http://localhost:3000
- [ ] Click "Connect Wallet" in the header
- [ ] Approve MetaMask connection
- [ ] Verify your address displays at the top

### 2. **File Upload & Encryption** ✓
- [ ] Navigate to "Upload File" tab
- [ ] Select any test file (PDF, image, text)
- [ ] Click "Upload & Encrypt"
- [ ] Wait for upload to complete
- [ ] Note displayed:
  - [ ] Blockchain Hash (0x...)
  - [ ] Encryption Key (hex string)
  - [ ] Success message

### 3. **File Verification** ✓
- [ ] Go to "Verify File" tab
- [ ] Upload the SAME file you just uploaded
- [ ] Paste the Blockchain Hash from Step 2
- [ ] Paste the Encryption Key from Step 2
- [ ] Click "Verify Integrity"
- [ ] Verify you see: ✅ File is AUTHENTIC!
- [ ] Download decrypted file and confirm it's readable

### 4. **Wrong Hash Detection** ✓
- [ ] In Verify tab, upload a DIFFERENT file
- [ ] Paste the hash from original file
- [ ] Click "Verify"
- [ ] Verify you see: ⚠️ File is TAMPERED! Hash mismatch detected.

### 5. **Missing Encryption Key** ✓
- [ ] In Verify tab, leave encryption key blank
- [ ] Click "Verify" 
- [ ] Verify it processes but file cannot decrypt
- [ ] Error message appears if key is invalid

### 6. **Access Control - Grant** ✓
- [ ] Go to "Access Control" tab
- [ ] Paste the blockchain hash from your upload
- [ ] Enter a test address (copy from Ganache or MetaMask):
  - Example: `0x742d35Cc6634C0532925a3b844Bc9b7595f0bEb`
- [ ] Click "✔️ Grant Access"
- [ ] Wait for transaction confirmation
- [ ] Verify no error appears

### 7. **Access Control - List** ✓
- [ ] In Access Control, paste the same blockchain hash
- [ ] Click "📋 List Access"
- [ ] Verify the address you granted access to appears in the list

### 8. **Access Control - Revoke** ✓
- [ ] In Access Control, keep the same hash and address
- [ ] Click "❌ Revoke Access"
- [ ] Wait for transaction confirmation
- [ ] Click "📋 List Access" again
- [ ] Verify the address no longer appears

### 9. **Edge Cases** ✓
- [ ] Try uploading large file (>50MB) → Should work or show clear error
- [ ] Try uploading without MetaMask connected → Should prompt connection
- [ ] Try verifying with wrong hash → Should show "Tampered"
- [ ] Try verifying with wrong key → Should fail to decrypt
- [ ] Try invalid Ethereum address → Should show error

### 10. **UI/UX Validation** ✓
- [ ] All buttons are responsive
- [ ] Error messages are clear and helpful
- [ ] Success messages confirm actions
- [ ] File uploads show progress
- [ ] No console errors (open Dev Tools)
- [ ] Loading states display during transactions

---

## Troubleshooting

### MetaMask Connection Issues
**Problem**: "Connect Wallet" button doesn't work  
**Solution**: 
- Ensure MetaMask is installed and enabled
- Check that you're on the correct network (Ganache or Sepolia)
- Try disconnecting and reconnecting in MetaMask

### Backend Connection Failed
**Problem**: "Cannot connect to blockchain"  
**Solution**:
- Verify Ganache is running on port 7545
- Check `.env` file has correct RPC URL
- Ensure contract address is valid
- Check backend logs for errors

### File Upload Fails
**Problem**: Upload returns 500 error  
**Solution**:
- Check backend is running (`npm start`)
- Verify `/backend/uploads` directory exists
- Check disk space available
- Review backend console for errors

### Hash Mismatch on Verification
**Problem**: Hash doesn't match even with same file  
**Solution**:
- Ensure you're uploading the exact same file
- File must not be modified between upload and verification
- Check you're using the correct blockchain hash
- Verify encryption key matches

### Transaction Failed
**Problem**: "Transaction reverted" error  
**Solution**:
- Ensure you have enough ETH (Ganache gives free ETH)
- Check contract address is correct
- Verify private key in `.env` is correct
- Check gas limit isn't too low

---

## Performance Notes

### Typical Transaction Times
- File Upload: 2-5 seconds (varies by file size)
- File Verification: 1-2 seconds
- Grant Access: 15-30 seconds (blockchain confirmation)
- Revoke Access: 15-30 seconds (blockchain confirmation)
- List Access: 1-2 seconds

### File Size Limits
- **Frontend**: Handles files up to browser memory limit (typically 500MB+)
- **Backend**: Limited by disk space and timeout (default 60 seconds)
- **Blockchain**: Only stores hash (minimal gas cost)

---

## Next Steps

Once testing is complete:

1. **Review Documentation**
   - Read `PROJECT_OVERVIEW.md` for complete feature overview
   - Study `TECHNICAL_ARCHITECTURE.md` to understand how it works
   - Check `ENCRYPTION_AND_SECURITY.md` for security details

2. **Deploy to Testnet**
   - Use Sepolia testnet for public testing
   - Deploy contract via Remix
   - Update backend `.env` with testnet details
   - Share with others for testing

3. **Security Audit** (Before Mainnet)
   - Conduct professional smart contract audit
   - Test with larger user load
   - Review all security assumptions

4. **Production Deployment**
   - Deploy to Ethereum mainnet
   - Set up monitoring and alerting
   - Configure HTTPS for frontend
   - Implement backup and recovery procedures

---

## Support

For detailed information:
- Architecture: See `docs/TECHNICAL_ARCHITECTURE.md`
- Security: See `docs/ENCRYPTION_AND_SECURITY.md`
- API Reference: See `docs/QUICK_REFERENCE.md`
- Smart Contract: See `docs/contracts/FileSecure.md`
- Real-world examples: See `docs/REAL_TIME_SCENARIO_DETAILED.md`

Happy testing! 🚀
