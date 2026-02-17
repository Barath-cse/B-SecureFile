# BlockSecure - Quick Start Guide

## 🚀 Phase 1: Foundation Setup (Week 1)

This guide walks you through setting up BlockSecure from scratch.

## Prerequisites

- **Node.js** v16+ - [Download](https://nodejs.org/)
- **MetaMask** - [Install Extension](https://metamask.io/)
- **Ganache** - [Download](https://www.trufflesuite.com/ganache)
- **Remix IDE** - [Open](https://remix.ethereum.org) (in browser)

## Step 1: Install Node.js

Verify installation:
```bash
node -v
npm -v
```

## Step 2: Install MetaMask

1. Visit https://metamask.io
2. Install browser extension
3. Create new wallet
4. Save seed phrase securely
5. Set up password

## Step 3: Setup Ganache (Local Blockchain)

1. Download Ganache from https://www.trufflesuite.com/ganache
2. Install and launch
3. Default settings:
   - Network: Localhost
   - Port: 7545
   - Ganache will show 10 test accounts with ETH

### Connect MetaMask to Ganache

1. Open MetaMask
2. Click Networks dropdown
3. Click "Add Network"
4. Fill in:
   - Network Name: `Ganache`
   - RPC URL: `http://localhost:7545`
   - Chain ID: `5777`
   - Currency Symbol: `ETH`
5. Click Save
6. Import account from Ganache:
   - Copy private key from Ganache
   - MetaMask > Import Account
   - Paste private key

## Step 4: Deploy Smart Contract

### Open Remix IDE

1. Go to https://remix.ethereum.org
2. Create new file: `FileSecure.sol`
3. Copy code from `contracts/FileSecure.sol`
4. In left panel select Solidity Compiler
5. Click "Compile FileSecure.sol"
6. Select "Deploy & Run Transactions"

### Deploy Contract

1. In "Environment" dropdown select "Injected Web3" (connects to MetaMask)
2. Make sure MetaMask is on Ganache network
3. Click "Deploy"
4. MetaMask will ask to confirm transaction
5. After deployment, copy contract address (shown in Remix)
6. Save this address!

## Step 5: Configure Backend

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Create `.env` file
Copy `.env.example` to `.env` and fill in:

```env
PORT=5000
BLOCKCHAIN_RPC=http://localhost:7545
CONTRACT_ADDRESS=0x...paste_contract_address_from_remix...
PRIVATE_KEY=0x...paste_your_ganache_private_key...
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start backend server
```bash
npm start
```

You should see:
```
🚀 BlockSecure Backend Server running on http://localhost:5000
```

## Step 6: Setup Frontend

### 1. Navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start React app
```bash
npm start
```

Browser will open to http://localhost:3000

## Step 7: Test the System

### 1. Connect Wallet
- Click "Connect MetaMask"
- MetaMask popup appears
- Select your account
- Click "Connect"

### 2. Upload a File
- Click "Upload File" tab
- Select a test file
- Click "Upload & Encrypt"
- File will be encrypted and uploaded
- Note the hash displayed

### 3. Verify File
- Click "Verify File" tab
- Upload the same file
- Paste the hash from step 2
- Click "Verify Integrity"
- Result: ✅ File is authentic if hash matches

## File Structure

```
BlockSecure/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── WalletConnect.js
│   │   │   ├── FileUpload.js
│   │   │   └── FileVerify.js
│   │   └── utils/
│   │       └── crypto.js
│   ├── public/
│   │   └── index.html
│   └── package.json
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── fileRoutes.js
│   │   └── blockchainRoutes.js
│   ├── uploads/
│   ├── .env
│   └── package.json
├── contracts/
│   ├── FileSecure.sol
│   └── FileSecure.md
└── README.md
```

## Troubleshooting

### Problem: MetaMask doesn't connect
**Solution:**
- Make sure MetaMask is on Ganache network
- Refresh page
- Check browser console for errors

### Problem: Backend errors with contract
**Solution:**
- Verify CONTRACT_ADDRESS in .env is correct
- Verify PRIVATE_KEY is correct format (with 0x)
- Make sure Ganache is running on port 7545

### Problem: File upload fails
**Solution:**
- Check backend console for detailed error
- Ensure `/uploads` folder exists
- Check file size (limit is 100MB)

### Problem: Hash mismatch when verifying
**Solution:**
- Make sure you're using the correct hash
- Original file must not be modified
- Download button should download encrypted file

## Next Steps (Phase 2)

After completing Phase 1:
- [ ] Add database for file metadata (MongoDB/PostgreSQL)
- [ ] Implement IPFS integration for decentralized storage
- [ ] Add user authentication system
- [ ] Create admin dashboard
- [ ] Implement file sharing with expiry
- [ ] Add audit logging
- [ ] Performance optimization
- [ ] Security hardening

## Useful Commands

### Terminal 1 - Backend
```bash
cd backend
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

### Terminal 3 - Check Services
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check if frontend is running
curl http://localhost:3000
```

## API Examples

### Upload File
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@myfile.pdf" \
  -F "fileName=myfile.pdf" \
  -F "owner=0x..." \
  -F "fileHash=abc123def456..." \
  -F "encryptionKey=xyz789..."
```

### Verify Hash
```bash
curl http://localhost:5000/api/verify/abc123def456
```

### Get User Files
```bash
curl http://localhost:5000/api/user-files/0x...wallet_address...
```

## Security Checklist

- [ ] Never commit `.env` file to Git
- [ ] Keep private keys secure
- [ ] Use different keys for different environments
- [ ] Enable MetaMask hardware wallet for production
- [ ] Implement rate limiting in production
- [ ] Use HTTPS in production
- [ ] Add input validation on all endpoints
- [ ] Implement authentication for sensitive endpoints

## Support

For issues or questions:
1. Check the main README.md
2. Review contract comments in FileSecure.sol
3. Check backend console for error details
4. Check browser console in frontend

---

**Happy Coding! 🎉**
