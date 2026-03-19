# BlockSecure – Blockchain-Based Secure File Integrity & Access Control System

A decentralized system combining blockchain, cryptography, and smart contracts to ensure file integrity, encryption, and controlled access.

---

## 🎯 Core Features

- **File Encryption**: AES-256 encryption before upload
- **Integrity Verification**: SHA-256 hashing for tamper-proof storage
- **Wallet Authentication**: MetaMask integration for user identification
- **Smart Contract Access Control**: Manage file permissions on-chain
- **Tamper Detection**: Automatic detection of file modifications
- **Local/Cloud Storage**: Flexible storage options (local or cloud-ready)
- **Granular Access Control**: Grant/revoke permissions to specific users
- **Non-Custodial**: You control your private keys, no passwords needed

---

## 🏗 System Architecture

```
User Layer (React Frontend)
    ↓
Encryption Layer (AES-256, SHA-256)
    ↓
API Layer (Node.js/Express Backend)
    ↓
Storage Layer (Local File System / Cloud Ready)
    ↓
Access Control Layer (Smart Contracts / Backend)
    ↓
Verification Layer (Hash Comparison)
```

**Data Flow:**
1. User connects with MetaMask wallet
2. File encrypted in browser with AES-256
3. SHA-256 hash calculated for encrypted file
4. Encrypted file + hash sent to backend
5. Backend stores securely in uploads folder
6. Access control enforced on download
7. Hash verified automatically on retrieval

---

## 📦 Project Structure

```
B-SecureFile/
├── frontend/                          # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.js           # Upload & encrypt files
│   │   │   ├── FileVerify.js           # Verify & download files
│   │   │   ├── AccessControl.js        # Grant/revoke access
│   │   │   └── WalletConnect.js        # MetaMask integration
│   │   ├── utils/
│   │   │   └── crypto.js               # AES-256 & SHA-256 functions
│   │   ├── styles/                     # CSS files
│   │   └── App.js                      # Main application
│   ├── package.json
│   └── public/
├── backend/                            # Node.js/Express server
│   ├── routes/
│   │   └── fileRoutes.js               # API endpoints (upload, download, verify, grant-access)
│   ├── uploads/                        # Encrypted file storage
│   │   ├── [fileId]                    # Encrypted file (binary)
│   │   ├── [fileId].json               # File metadata
│   │   └── [fileId].access.json        # Access control list
│   ├── server.js                       # Express server
│   ├── package.json
│   └── public/                         # Static files
├── contracts/                          # Solidity smart contracts
│   ├── FileSecure.sol                  # Access control contract
│   └── FileSecure.md                   # Contract documentation
├── docs/
│   ├── COMPLETE_GUIDE.md               # Full comprehensive guide
│   ├── PRODUCTION_READINESS_ASSESSMENT.md
│   └── [other documentation]
└── README.md                           # You are here
```

---

## 🛠 Setup Instructions

### Prerequisites

- **Node.js** v16 or higher ([download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MetaMask** browser extension ([install](https://metamask.io/))
- **Git** for version control (optional)
- Any modern browser (Chrome, Firefox, Edge, Safari)

### 1. Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd B-SecureFile

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

### 3. Connect MetaMask

1. Install MetaMask extension in your browser
2. Create or import a wallet
3. Click **"Connect Wallet"** in the app
4. Approve the connection in MetaMask pop-up
5. You're ready to upload!

### 4. Optional: Configure Blockchain

To enable smart contract integration (optional):

1. Install Ganache: https://www.trufflesuite.com/ganache
2. Start Ganache on port 7545
3. Import Ganache accounts into MetaMask
4. Deploy `contracts/FileSecure.sol` using Remix
5. Update backend with contract address

---

## 🔐 How It Works

### File Upload Process

1. **Select File** - User chooses file from their computer
2. **Encrypt** - AES-256 encryption applied in browser with wallet-derived key
3. **Calculate Hash** - SHA-256 hash computed on encrypted file
4. **Send to Backend** - Encrypted file + hash + metadata sent via POST
5. **Store Securely** - Backend stores encrypted file and hash
6. **Return File ID** - User receives unique File ID to share

**Security:** Original file never transmitted unencrypted. Backend cannot read file without key.

### File Verification & Download

1. **Request Download** - User provides File ID and their wallet address
2. **Check Access** - Backend verifies user has permission
3. **Send File** - Encrypted file returned from backend
4. **Verify Hash** - Frontend recalculates SHA-256 hash
5. **Compare Hashes** - If stored hash ≠ calculated hash → TAMPERING DETECTED ⚠️
6. **Decrypt** - User provides encryption key to decrypt in browser

**Security:** Automatic verification prevents tampering. File integrity guaranteed.

### Access Control

1. **File Owner** uploads file
2. **Owner Grants Access** - Runs `POST /api/grant-access`
3. **Backend Updates** - Adds user address to `[fileId].access.json`
4. **User Downloads** - When user requests file, backend checks access list
5. **Access Granted/Denied** - User can only download if authorized
6. **Instant Revoke** - Owner runs `POST /api/revoke-access` to immediately block access

**Security:** Granular permission control. Only authorized users can download.

---

## 🧪 Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js | User interface & components |
| **Authentication** | MetaMask | Wallet-based authentication |
| **Encryption** | CryptoJS | AES-256 encryption & SHA-256 hashing |
| **Backend** | Node.js + Express | REST API server |
| **File Upload** | Multer | File upload handling |
| **Storage** | Local File System | Encrypted file storage |
| **Metadata** | JSON files | File info & access lists |
| **Blockchain** | Solidity/Ethereum | Smart contracts (optional) |
| **Package Manager** | npm | Dependency management |

---

## 📝 API Endpoints

### File Management

```bash
POST /api/upload
# Upload & encrypt file
# Body: multipart/form-data
#   - file: (binary) encrypted file
#   - fileName: (string) original filename
#   - fileId: (string) unique ID
#   - owner: (string) wallet address
#   - fileHash: (string) SHA-256 hash
# Response: { fileId, owner, hash, timestamp }

GET /api/file/:fileId?userAddress=0xaddr...
# Download encrypted file
# Query: userAddress (wallet address for access check)
# Response: Binary encrypted file (200/403/404)

POST /api/verify-file-hash
# Verify file integrity
# Body: { fileId, uploadedHash, userAddress }
# Response: { isValid, storedHash, uploadedHash }
```

### Access Control

```bash
POST /api/grant-access
# Grant file access to user
# Body: { fileId, owner, userAddress }
# Response: { message, accessList }

POST /api/revoke-access
# Revoke file access from user
# Body: { fileId, owner, userAddress }
# Response: { message, accessList }

GET /api/access-list/:fileId/:owner
# View users with access to file
# Response: { fileId, owner, fileName, accessList }
```

---

## 🔗 Smart Contract Functions

*Located in: `contracts/FileSecure.sol`*

```solidity
// Upload file to blockchain
uploadFile(string hash, address owner) 
  → Returns: fileId, timestamp

// Verify file authenticity
verifyFile(string hash) 
  → Returns: boolean isValid

// Grant access permission
grantAccess(uint fileId, address user)
  → Emits: AccessGranted(fileId, user)

// Check if user has access
hasAccess(uint fileId, address user) 
  → Returns: boolean hasAccess

// Get file details
getFileDetails(uint fileId) 
  → Returns: hash, owner, timestamp, accessCount

// Revoke access permission
revokeAccess(uint fileId, address user)
  → Emits: AccessRevoked(fileId, user)
```

---

## 📚 Security Considerations

### Encryption Security

✅ **AES-256 (Advanced Encryption Standard)**
- 256-bit key = $2^{256}$ possible combinations
- Military-grade encryption standard (NIST approved)
- Computationally infeasible to brute-force
- Backend cannot read encrypted files

✅ **SHA-256 (Secure Hash Algorithm)**
- 256-bit cryptographic hash function
- One-way function (impossible to reverse)
- Deterministic (same input = same hash, always)
- Collision-resistant (changes to file immediately detected)

### Authentication Security

✅ **MetaMask Wallet Authentication**
- Non-custodial (users control private keys)
- No passwords to steal or forget
- Fully compatible with Ethereum ecosystem
- Industry-standard wallet integration

### Access Control Security

✅ **Fine-Grained Permissions**
- Owner can grant/revoke access individually
- Access list stored securely in backend
- Access enforced at HTTP layer (mandatory check)
- Owner always has access (no permission revocation)

### Data Storage Security

⚠️ **Current Limitations**
- Files stored on local filesystem (not encrypted on disk)
- Access lists stored in JSON files (not database)
- Single server (no redundancy yet)
- No automatic backups

**Production Recommendations:**
- Use cloud storage (AWS S3) with encryption at rest
- Migrate to PostgreSQL database
- Implement TLS/HTTPS for transport
- Set up daily automated backups
- Add audit logging for all operations
- Implement rate limiting to prevent abuse
- Enable security headers (CORS, CSP, etc.)

---

## 📖 Quick Start

```bash
# 1. Install dependencies
cd frontend && npm install && cd ../backend && npm install

# 2. Start backend
cd backend && npm start

# 3. Start frontend (in new terminal)
cd frontend && npm start

# 4. Open http://localhost:3000 in browser
# 5. Connect MetaMask wallet
# 6. Upload, verify, and share files!
```

---

## 📄 License

MIT License - Free to use for educational and commercial purposes

---

## 👨‍💻 Author

BlockSecure Development Team

---

**For comprehensive documentation, see [COMPLETE_GUIDE.md](docs/COMPLETE_GUIDE.md)**
