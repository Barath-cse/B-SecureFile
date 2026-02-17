# BlockSecure - Directory Structure

```
B-SecureFile/
│
├── 📄 README.md                          # Main project documentation
├── 📄 SETUP_GUIDE.md                     # Step-by-step setup instructions
├── 📄 COMPLETION_CHECKLIST.md            # Phase 1 completion status
├── 📄 ROADMAP.md                         # Future phases & features
├── 📄 ARCHITECTURE.md                    # System architecture & diagrams
├── 📄 TECHNICAL_SPECS.md                 # Technical specifications
├── 📄 .gitignore                         # Git ignore patterns
├── 📄 setup.sh                           # Linux/Mac setup script
├── 📄 setup.bat                          # Windows setup script
│
├── 📁 frontend/                          # React frontend application
│   ├── 📄 package.json                   # Frontend dependencies
│   ├── 📄 .gitignore                     # Frontend-specific ignores
│   │
│   ├── 📁 public/
│   │   └── 📄 index.html                 # HTML entry point
│   │
│   └── 📁 src/
│       ├── 📄 index.js                   # React root
│       ├── 📄 App.js                     # Main app component
│       ├── 📄 App.css                    # App styles
│       │
│       ├── 📁 components/
│       │   ├── 📄 WalletConnect.js       # MetaMask connection component
│       │   ├── 📄 FileUpload.js          # File upload & encrypt component
│       │   └── 📄 FileVerify.js          # File verify & decrypt component
│       │
│       ├── 📁 styles/
│       │   ├── 📄 WalletConnect.css      # Wallet connection styles
│       │   ├── 📄 FileUpload.css         # Upload component styles
│       │   └── 📄 FileVerify.css         # Verify component styles
│       │
│       └── 📁 utils/
│           └── 📄 crypto.js              # Encryption utilities
│               ├── calculateHash()       # SHA-256
│               ├── encryptFile()         # AES-256
│               ├── decryptFile()         # AES-256 decrypt
│               ├── generateEncryptionKey()
│               ├── hashPassword()        # Password hashing
│               └── generateToken()       # Token generation
│
├── 📁 backend/                           # Node.js/Express backend
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 server.js                      # Express server setup
│   ├── 📄 .env                           # Environment config [SECRET]
│   ├── 📄 .env.example                   # Environment template
│   ├── 📄 .gitignore                     # Backend-specific ignores
│   │
│   ├── 📁 routes/
│   │   ├── 📄 fileRoutes.js              # File management endpoints
│   │   │   ├── POST /upload             # Upload encrypted file
│   │   │   ├── GET /file/:fileId        # Download file
│   │   │   ├── GET /file-metadata/:id   # Get metadata
│   │   │   ├── GET /user-files/:addr    # User files
│   │   │   └── POST /verify             # Verify file
│   │   │
│   │   └── 📄 blockchainRoutes.js        # Blockchain integration
│   │       ├── POST /store-hash         # Store hash on-chain
│   │       ├── GET /verify-blockchain   # Verify hash on-chain
│   │       ├── POST /grant-access       # Grant permission
│   │       ├── GET /check-access        # Check permission
│   │       └── GET /network-info        # Network details
│   │
│   ├── 📁 utils/
│   │   └── 📄 crypto.js                  # Server crypto utilities
│   │       ├── calculateHash()          # SHA-256
│   │       ├── generateSalt()           # Salt generation
│   │       ├── hashPassword()           # Password hashing
│   │       └── verifyPassword()         # Password verification
│   │
│   └── 📁 uploads/                      # Uploaded files directory
│       ├── [encrypted-files]            # Stored encrypted files
│       └── [metadata-json]              # File metadata files
│
├── 📁 contracts/                         # Solidity smart contracts
│   ├── 📄 FileSecure.sol                 # Main smart contract
│   │   ├── uploadFile()                 # Register file hash
│   │   ├── verifyFile()                 # Check hash exists
│   │   ├── grantAccess()                # Grant permission
│   │   ├── revokeAccess()               # Revoke permission
│   │   ├── hasAccess()                  # Check permission
│   │   ├── getFileDetails()             # Get file info
│   │   ├── getAccessList()              # Get allowed users
│   │   └── getAccessCount()             # Count with access
│   │
│   └── 📄 FileSecure.md                  # Contract documentation
│       ├── Overview
│       ├── Functions
│       ├── Events
│       ├── Deployment
│       ├── Testing
│       └── Use Cases
│
└── 📄 .gitignore                         # Root .gitignore
```

## 📊 File Purpose Summary

### Documentation Files
| File | Purpose |
|------|---------|
| README.md | Project overview & features |
| SETUP_GUIDE.md | Installation & first run |
| COMPLETION_CHECKLIST.md | Phase 1 completion status |
| ROADMAP.md | Future features & timeline |
| ARCHITECTURE.md | System design & diagrams |
| TECHNICAL_SPECS.md | Technical specifications |

### Configuration Files
| File | Purpose |
|------|---------|
| package.json | Dependencies & scripts |
| .env | Secrets & configuration |
| .env.example | Configuration template |
| .gitignore | Files to exclude from git |

### Source Code
| File | Purpose |
|------|---------|
| frontend/src/App.js | Main React component |
| frontend/src/components/*.js | UI components |
| frontend/src/utils/crypto.js | Encryption utilities |
| backend/server.js | Express server |
| backend/routes/*.js | API endpoints |
| contracts/FileSecure.sol | Smart contract |

## 🎯 Quick File Locations

**To understand the project:**
→ Start with [README.md](README.md)

**To set up the project:**
→ Follow [SETUP_GUIDE.md](SETUP_GUIDE.md)

**To understand the architecture:**
→ Read [ARCHITECTURE.md](ARCHITECTURE.md)

**To see what's built:**
→ Check [COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md)

**To see what's coming:**
→ Review [ROADMAP.md](ROADMAP.md)

**For technical details:**
→ Consult [TECHNICAL_SPECS.md](TECHNICAL_SPECS.md)

## 📦 Total Files Created

- **Documentation:** 8 files
- **Frontend:** 12 files
- **Backend:** 6 files
- **Contracts:** 2 files
- **Configuration:** 4 files
- **Scripts:** 2 files

**Total: 34 files**

## 📈 Code Statistics

**Frontend (React)**
- Components: 3
- Utility files: 1
- Style files: 4
- Config files: 1
- Total lines: ~1,500

**Backend (Express)**
- Server file: 1
- Route files: 2
- Utility files: 1
- Config files: 2
- Total lines: ~800

**Smart Contracts (Solidity)**
- Contract files: 1
- Doc files: 1
- Total lines: ~400

---

**Total: 34 files | ~2,700 lines of code & documentation**
