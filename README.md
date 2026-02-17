# BlockSecure – Blockchain-Based Secure File Integrity & Access Control System

A decentralized system combining blockchain, cryptography, and smart contracts to ensure file integrity, encryption, and controlled access.

## 🎯 Core Features

- **File Encryption**: AES-256 encryption before upload
- **Integrity Verification**: SHA-256 hashing stored on blockchain
- **Wallet Authentication**: MetaMask integration for user identification
- **Smart Contract Access Control**: Manage file permissions on-chain
- **Tamper Detection**: Automatic detection of file modifications
- **IPFS/Local Storage**: Decentralized or local file storage

## 🏗 System Architecture

```
User Layer (React Frontend)
    ↓
Encryption Layer (AES-256, SHA-256)
    ↓
Storage Layer (IPFS / Local Server)
    ↓
Blockchain Layer (Smart Contracts)
    ↓
Verification Layer (Hash Comparison)
```

## 📦 Project Structure

```
B-SecureFile/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Encryption, hashing utilities
│   │   └── App.js         # Main app component
│   ├── package.json
│   └── public/
├── backend/               # Node.js/Express server
│   ├── routes/            # API routes
│   ├── utils/             # Server utilities
│   ├── uploads/           # Local file storage
│   ├── server.js          # Main server file
│   └── package.json
├── contracts/             # Solidity smart contracts
│   └── FileSecure.sol
└── README.md
```

## 🛠 Setup Instructions

### Prerequisites
- Node.js v16+
- npm or yarn
- MetaMask browser extension
- Ganache (or use Sepolia testnet)
- Remix IDE (for contract deployment)

### 1. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 2. Configure Blockchain

**Option A: Local Blockchain (Ganache)**
- Install Ganache: https://www.trufflesuite.com/ganache
- Start Ganache (Port: 7545)
- Import wallet seed phrase into MetaMask

**Option B: Sepolia Testnet**
- Switch MetaMask to Sepolia
- Get testnet ETH from faucet: https://sepoliafaucet.com

### 3. Deploy Smart Contract

1. Open Remix IDE: https://remix.ethereum.org
2. Create new file: `FileSecure.sol`
3. Copy contract code from `contracts/FileSecure.sol`
4. Deploy with MetaMask on Ganache/Sepolia
5. Copy contract address

### 4. Configure Backend

Create `.env` file in `backend/`:
```
PORT=5000
BLOCKCHAIN_RPC=http://localhost:7545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_wallet_private_key
```

### 5. Start Services

**Terminal 1 - Backend**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm start
```

## 🔐 How It Works

### File Upload
1. User connects wallet (MetaMask)
2. Selects file to upload
3. Frontend encrypts file with AES-256
4. Calculates SHA-256 hash
5. Stores encrypted file in IPFS/local storage
6. Stores hash on blockchain via smart contract
7. Stores file metadata in backend

### File Verification
1. User downloads file
2. Frontend decrypts file with AES-256
3. Recalculates SHA-256 hash
4. Compares hash with blockchain record
5. If match: File is authentic
6. If mismatch: File has been tampered

## 🧪 Technologies

- **Frontend**: React, Web3.js, crypto-js
- **Backend**: Node.js, Express, multer, ethers.js
- **Blockchain**: Solidity, Ganache, MetaMask
- **Encryption**: AES-256, SHA-256
- **Storage**: IPFS / Local Server

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload encrypted file |
| GET | `/api/file/:fileId` | Download file |
| GET | `/api/verify/:fileId` | Verify file hash |
| POST | `/api/grant-access` | Grant file access permission |
| GET | `/api/user-files/:userAddress` | Get user's files |

## 🔗 Smart Contract Functions

- `uploadFile(string hash, address owner)` - Register file on blockchain
- `verifyFile(string hash)` - Verify file integrity
- `grantAccess(uint fileId, address user)` - Grant access permission
- `hasAccess(uint fileId, address user)` - Check access permission
- `getFileDetails(uint fileId)` - Get file metadata

## 📚 Security Considerations

- AES-256 encryption ensures confidentiality
- SHA-256 hashing ensures integrity
- Blockchain immutability ensures authenticity
- Smart contracts enforce access control
- Private keys secured in environment variables

## 🚀 Future Enhancements

- [ ] Zero-knowledge proofs for privacy
- [ ] Multi-signature access control
- [ ] File versioning system
- [ ] Enhanced UI/UX
- [ ] Integration with actual IPFS network
- [ ] Audit logging

## 📄 License

MIT License

## 👨‍💻 Author

BlockSecure Development Team
