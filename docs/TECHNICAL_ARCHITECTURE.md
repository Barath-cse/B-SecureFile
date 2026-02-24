# Technical Architecture

This document describes the system architecture, data models, technology stack, and technical specifications for BlockSecure.

---

## System Architecture

### Layered Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LAYER                               │
│            (React Frontend - Web Browser)                   │
│  - UI Components, Wallet Connection, Encryption Logic      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / WebSocket
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 ENCRYPTION LAYER                            │
│          (Client-Side Cryptography)                        │
│  - AES-256 Encryption/Decryption                           │
│  - SHA-256 File Hashing                                    │
│  - Key Generation and Management                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ Encrypted File + Metadata
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER                                 │
│            (Node.js/Express Backend)                       │
│  - Upload Endpoint: /api/upload                            │
│  - Verify Endpoint: /api/verify                            │
│  - Access Control Endpoints                                │
└──────────────────────────┬──────────────────────────────────┘
                           │ File Hash Only
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  STORAGE LAYER                              │
│            (Local File System)                             │
│  - /uploads/[timestamp]-[id]-blob                          │
│  - Encrypted files (unreadable without key)                │
└──────────────────────────┬──────────────────────────────────┘
                           │ Smart Contract Call
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              BLOCKCHAIN LAYER                               │
│            (Ethereum Smart Contract)                       │
│  - File Hash Storage (Immutable)                           │
│  - Access Control Management                               │
│  - Permission Enforcement                                  │
│  - Event Logging                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### File Upload Flow

```
1. User Browser
   └─ Select file
   └─ Generate AES-256 encryption key
   └─ Encrypt file with key
   └─ Calculate SHA-256 hash of encrypted content

2. Frontend sends:
   POST /api/upload
   {
     file: [encrypted bytes],
     encryptionKey: "a1b2c3...",
     fileName: "lawsuit.pdf",
     owner: "0xLawyer123..."
   }

3. Backend:
   └─ Receive encrypted file
   └─ Save to disk: /uploads/[timestamp]-[id]-blob
   └─ Store metadata in memory/database
   └─ Call smart contract: uploadFile(hash)

4. Blockchain:
   └─ Record hash on-chain
   └─ Emit FileUploaded event
   └─ Return transaction hash

5. Frontend:
   └─ Display blockchain hash
   └─ Display encryption key
   └─ Ready for sharing
```

### File Verification Flow

```
1. User provides:
   - Downloaded encrypted file
   - Encryption key
   - Blockchain hash (from previous upload)

2. Frontend:
   └─ Decrypt file using provided key
   └─ Calculate SHA-256 hash of decrypted content
   └─ Compare with blockchain hash
   └─ Display result (authentic or tampered)

3. Optional: Download decrypted file
   └─ Save to user's computer
   └─ Browser handles download (not backend)
```

---

## Backend Architecture

### Express Routes

```
POST /api/upload
  - Accept encrypted file + metadata
  - Store encrypted file
  - Record hash on blockchain
  - Return file ID

GET /api/file/:fileId
  - Retrieve encrypted file
  - (Note: doesn't decrypt; file must be decrypted client-side)

GET /api/verify/:fileId
  - Verify file exists and hash is recorded on blockchain
  - Return hash for comparison

POST /api/grant-access
  - Call smart contract grantAccess()
  - Record permission on-chain

POST /api/revoke-access
  - Call smart contract revokeAccess()
  - Remove permission on-chain
```

### Database/Storage Model

**Current Implementation**: In-memory metadata + disk-based file storage

```
File Metadata (stored in backend memory/database):
{
  fileId: Number,
  fileName: String,
  owner: String ("0x..."),
  blockchainHash: String ("0x..."),
  encryptionKey: String ("a1b2c3..."),
  uploadedAt: Date,
  size: Number
}

File Storage:
/uploads/
  ├── 1770924129264-4fz5k-blob (encrypted bytes)
  ├── 1770924129264-4fz5k-blob.json (metadata)
  ├── 1770925474097-33zaej-blob
  ├── 1770925474097-33zaej-blob.json
  └── ...
```

### Blockchain Interaction

**Technology**: ethers.js v6  
**Chain**: Ethereum (Sepolia testnet or Ganache for dev)  
**Contract**: FileSecure.sol (Solidity ^0.8.0)

```javascript
// Backend blockchain interactions:
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

// Record hash
await contract.uploadFile(fileHash);

// Grant access
await contract.grantAccess(fileId, userAddress);

// Check access permission
const hasAccess = await contract.hasAccess(fileId, userAddress);
```

---

## Frontend Architecture

### Component Structure

```
src/
├── App.js (Main app, router, MetaMask connection)
├── components/
│   ├── WalletConnect.js (MetaMask integration)
│   ├── FileUpload.js (Upload & encryption)
│   ├── FileVerify.js (Verification & decryption)
│   └── AccessControl.js (Grant/revoke permissions)
├── styles/
│   ├── App.css
│   ├── FileUpload.css
│   ├── FileVerify.css
│   └── AccessControl.css
└── utils/
    └── crypto.js (AES-256, SHA-256, key generation)
```

### Encryption Utilities (crypto.js)

```javascript
// Key generation
generateEncryptionKey() → String (64 hex chars)

// File encryption (AES-256)
encryptFile(file, key) → Blob

// File decryption
decryptFile(encryptedFile, key) → Blob

// Hash calculation (SHA-256)
calculateHash(file) → String (hex hash)
```

### State Management

**Current**: React hooks (useState)  
**Per Component**:
- FileUpload: file, fileName, encryptionKey, loading, status
- FileVerify: file, blockchainHash, encryptionKey, loading, result
- AccessControl: fileHash, grantAddress, accessList, loading
- WalletConnect: account, isConnected, network

---

## Smart Contract Specification

### FileSecure.sol

```solidity
pragma solidity ^0.8.0;

struct File {
    string hash;          // SHA-256 hash of encrypted content
    address owner;        // Uploader's address
}

mapping(uint => File) files;                    // File registry
mapping(uint => mapping(address => bool)) access;  // Permissions

Events:
  - FileUploaded(uint indexed fileId, string hash, address indexed owner)
  - AccessGranted(uint indexed fileId, address indexed user)

Functions:
  - uploadFile(string _hash) external
  - verifyFile(string _hash) external view returns (bool)
  - grantAccess(uint fileId, address user) external
  - hasAccess(uint fileId, address user) external view returns (bool)
  - getFileDetails(uint fileId) external view returns (string, address)
```

---

## Technology Stack Details

### Frontend Stack
- **React 18.2.0**: UI framework and component management
- **Web3.js / ethers.js**: Blockchain interaction and smart contract calls
- **crypto-js**: AES-256 encryption and SHA-256 hashing
- **Create React App**: Build tooling and webpack bundling
- **CSS3**: Styling with gradients and animations

### Backend Stack
- **Node.js**: JavaScript runtime
- **Express 4.18.2**: HTTP server and routing
- **multer 1.4.5**: File upload handling
- **ethers.js 6.7.1**: Ethereum interaction
- **dotenv 16.0.3**: Environment variable management
- **CORS**: Cross-origin resource sharing

### Blockchain Stack
- **Solidity ^0.8.0**: Smart contract language
- **Ethereum**: Mainnet/Testnet/Ganache
- **MetaMask**: Wallet provider for signing transactions
- **Remix IDE**: Smart contract development and deployment

### Encryption Stack
- **Web Crypto API**: Native browser cryptography
- **crypto-js**: Additional encryption utilities
- **AES-256**: Symmetric encryption algorithm
- **SHA-256**: Cryptographic hashing algorithm

---

## Security Architecture

### Client-Side Protection
```
File Selection
    ↓
Stream to Memory Buffer
    ↓
Encrypt with AES-256 [ENCRYPTED]
    ↓
Calculate Hash (SHA-256) [ORIGINAL CONTENT NEVER LEAVES UNENCRYPTED]
    ↓
Send to Backend [ONLY ENCRYPTED BYTES + KEY]
```

### Server-Side Protection
```
Receive Encrypted File
    ↓
Store on Disk [CANNOT READ WITHOUT KEY]
    ↓
Record Hash Only on Blockchain [IMMUTABLE PROOF]
    ↓
Never Decrypt [SERVER CANNOT READ FILE]
```

### Verification Process
```
User Provides:
  - Encrypted File (from disk)
  - Encryption Key (from user)
  - Blockchain Hash (from smart contract)

Frontend Decrypts File
    ↓
Recalculate Hash
    ↓
Compare with Blockchain Hash
    ↓
Match = Authentic ✅
Mismatch = Tampered ⚠️
```

---

## Performance Characteristics

### Time Complexity
- Upload: O(n) where n = file size (encryption I/O)
- Verification: O(n) where n = file size (hashing I/O)
- Hash Comparison: O(1)
- Access Check: O(1)

### Space Complexity
- Stored per file: O(n) where n = file size (encrypted blob)
- Metadata: O(1) (fixed size)
- Blockchain: O(64 bytes) per hash (SHA-256)
- Memory: O(n) during upload/verification (file in memory)

### Transaction Costs (Gas)
- uploadFile(): ~50,000 gas
- grantAccess(): ~50,000 gas
- revokeAccess(): ~35,000 gas
- hasAccess(): 0 gas (read-only)
- getFileDetails(): 0 gas (read-only)

---

## Error Handling

### Frontend Errors
- Network errors: Display user-friendly message
- Encryption errors: Catch and report
- Wallet errors: Prompt connection or network switch
- Hash mismatch: Alert tamper detection

### Backend Errors
- File upload errors: 400/500 responses with error details
- Blockchain errors: Propagate with context
- Storage errors: Log and return error message
- Validation errors: 400 Bad Request with details

### Smart Contract Errors
- Unauthorized access: Revert with reason
- File not found: Revert with error
- Invalid address: Revert with validation error

---

## Scalability Considerations

### Current Limits
- File size: Limited by browser memory (typically 500MB+)
- Concurrent users: Limited by backend resources
- Storage: Limited by disk space
- Blockchain: Limited by network gas costs and block space

### Future Improvements
- Implement database (PostgreSQL, MongoDB) instead of in-memory
- Add queue system (Bull, RabbitMQ) for async processing
- Integrate IPFS for decentralized file storage
- Implement connection pooling for blockchain RPCs
- Add caching layer (Redis) for frequently accessed data
- Implement CDN for frontend assets

---

## Deployment Architecture

### Local Development
- Ganache on localhost:7545
- Backend on localhost:5000
- Frontend on localhost:3000
- No HTTPS required

### Testnet Deployment
- Sepolia test network
- Backend on cloud server (AWS, DigitalOcean, etc.)
- Frontend on CDN (Vercel, Netlify, etc.)
- HTTPS enabled
- Environment variables in `.env` file

### Mainnet Deployment
- Ethereum mainnet
- Multi-region backend deployment
- Global CDN for frontend
- Production-grade monitoring
- Automated backups
- Rate limiting and DDoS protection

---

## Monitoring & Observability

### Current Implementation
- Console logging in backend
- Browser console for frontend errors
- MetaMask notifications for transactions

### Production Recommendations
- Application logging system (Winston, Pino)
- Error tracking (Sentry, LogRocket)
- Performance monitoring (DataDog, New Relic)
- Blockchain event monitoring
- Uptime monitoring
- Alert system for critical errors

---

This architecture is designed for security, scalability, and maintainability while keeping the system straightforward and easy to understand.
