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
2. Get **FREE testnet ETH** from faucet (see "Getting Free Gas" section below)
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

## Getting Free Gas (Testnet ETH)

### What is "Gas"?
Gas is the fee you pay to execute blockchain transactions. Since we're using **testnets** (not real money), you can get free testnet ETH from faucets for testing.

### Free Gas Faucets by Network

#### 1. **Sepolia Testnet** (Recommended)

**Official Faucets:**

**Option A: Sepolia Official Faucet** (Most Reliable)
- URL: https://sepolia-faucet.pk910.de/
- Steps:
  1. Go to the faucet website
  2. Paste your MetaMask address (copy from wallet)
  3. Click "Claim Testnet Funds"
  4. Wait 24 hours for next claim
  5. Receive 0.05 - 1 ETH per claim
- **Frequency**: Every 24 hours
- **Amount**: 0.05 - 1 ETH per claim

**Option B: Alchemy Faucet** (Fast, Requires Free Account)
- URL: https://sepoliafaucet.com/
- Steps:
  1. Go to faucet website
  2. Sign up with email or GitHub (free)
  3. Paste your Sepolia address
  4. Click "Send Me ETH"
  5. Receive ETH in 1-2 minutes
- **Frequency**: Every 24 hours
- **Amount**: 0.5 ETH per claim

**Option C: QuickNode Faucet** (Quick, Requires Free Account)
- URL: https://faucet.quicknode.com/ethereum/sepolia
- Steps:
  1. Go to faucet website
  2. Sign in with GitHub or Google (free)
  3. Paste your Sepolia address
  4. Click "Claim Testnet Funds"
  5. Receive 0.5 ETH
- **Frequency**: Every 24 hours
- **Amount**: 0.5 ETH per claim

#### 2. **Ganache (Local Development)** - FREE, UNLIMITED

For local testing, use **Ganache**:

**Why Use Ganache:**
- ✅ **100% FREE** - No actual value
- ✅ **Unlimited gas** - Each account starts with 100 ETH
- ✅ **Instant** - All transactions happen in 1 second
- ✅ **Risk-free** - No real money involved
- ✅ **Perfect for development** - Fastest iteration

**How to Get Free ETH in Ganache:**
1. Download Ganache: https://www.trufflesuite.com/ganache
2. Launch the application
3. In the main window, you'll see 10 test accounts
4. Each account has **100 ETH** by default (fake money)
5. Copy any address and use it in MetaMask
6. You have unlimited transactions!

**Example Ganache Account:**
```
Address: 0x742d35Cc6634C0532925a3b844Bc9b7595f0bEb
Balance: 100 ETH (infinite, only on Ganache)
```

---

## How Much Gas Do You Need?

### For BlockSecure Testing:

**Single File Upload & Verification:**
- Contract deployment: ~2-3 million gas (~0.5 ETH on mainnet)
- Upload file hash: ~50,000 gas (~$2-5 on mainnet)
- Grant access: ~60,000 gas (~$3-6 on mainnet)
- Revoke access: ~50,000 gas (~$2-5 on mainnet)
- Verify file: Free (read-only, no gas needed)

**Testnet Amounts You Need:**
- **Ganache**: You're set! 100 ETH per account
- **Sepolia**: 0.5-1 ETH is plenty for 100+ transactions
- **Goerli**: 0.5-1 ETH is plenty for 100+ transactions

### Gas Price Monitoring:

**Check current gas prices:**
- Sepolia: https://sepolia.etherscan.io/gastracker
- Mainnet: https://etherscan.io/gastracker (for reference)

---

## Complete Setup Flow with Free Gas

### For Local Development (Ganache - Fastest):
```
1. Install Ganache → Unlimited FREE gas ✅
2. Create custom network in MetaMask (http://127.0.0.1:7545)
3. Each account has 100 ETH automatically
4. Deploy contract and test
5. Zero cost, instant transactions
```

### For Testnet Testing (Sepolia - Public):
```
1. Switch MetaMask to Sepolia
2. Claim free testnet ETH from faucet (see options above)
3. Wait for confirmation (instant to 2 minutes)
4. Deploy contract and test
5. Zero real-world cost, ~15-30 seconds per transaction
```

---

## Troubleshooting Gas Issues

### "Insufficient Funds" Error
**Problem**: Transaction fails because you don't have enough ETH  
**Solution**:
- On Ganache: Use a different account (all have 100 ETH)
- On Sepolia: Claim more ETH from faucet above
- Check how much ETH is in your account (MetaMask shows balance)
- Estimate gas cost: ~20-200k gas × 1 gwei (testnet) = 0.00002-0.0002 ETH

### "Gas Too Low" Error
**Problem**: Gas limit is set too low  
**Solution**:
- Increase gas limit in MetaMask to 500,000 (safe default)
- Most transactions use 50,000-200,000 gas
- MetaMask auto-estimates, but can be increased manually

### Testnet Faucet Not Working
**Problem**: Faucet webpage is down or rate-limited  
**Solution**:
- Try a different faucet (3 options listed above)
- Wait the rate-limit period (usually 24 hours)
- Use Ganache instead (no internet required, unlimited)
- Check faucet status: https://status.sepolia.io

### Slow Transactions on Sepolia
**Problem**: Transaction taking > 1 minute  
**Solution**:
- This is normal (Sepolia is slower than mainnet)
- Wait longer, blockchain is working
- Check transaction on Etherscan: https://sepolia.etherscan.io
- Paste your transaction hash to see status

---

## Important Notes

⚠️ **Testnet ETH ≠ Real Money**
- Sepolia/Goerli ETH has ZERO value
- Only used for testing on public testnets
- Cannot be traded or converted to real money
- Safe to get from anyone offering it

✅ **Ganache ETH is Completely Free**
- Only exists on your local machine
- 100% free and unlimited
- Perfect for development
- No internet required

✅ **Best Practice**
1. **Develop locally** with Ganache (unlimited, instant)
2. **Test publicly** with Sepolia (free faucets, realistic)
3. **Audit thoroughly** before mainnet
4. **Deploy to mainnet** only when ready

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

4. **Deploy to Testnet**
   - Use Sepolia testnet for public testing
   - Get free ETH from faucets (see "Getting Free Gas" section)
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
- Free Gas & Faucets: See section "Getting Free Gas" above in this document

Happy testing! 🚀
