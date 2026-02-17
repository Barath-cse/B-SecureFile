# BlockSecure - Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites Check
```bash
node --version    # Should be v16+
npm --version     # Should be v8+
```

### 2. Setup Environment
```bash
# Linux/Mac
bash setup.sh

# Windows
setup.bat
```

### 3. Configure Backend
```bash
cd backend
# Edit .env file with your details
```

### 4. Start Service
```bash
cd backend
npm install        # Install dependencies
npm start          # Start unified server on http://localhost:5000
```

### 5. Test It
1. Open http://localhost:5000 in your browser
2. Click "Connect MetaMask"
3. Upload a file
4. Verify the file
5. ✅ Done!

---

## 📚 Key Concepts

### What is SHA-256?
- **Cryptographic hash function**
- **Input:** Any file (any size)
- **Output:** 64-character unique fingerprint
- **Property:** Changing 1 bit in file changes entire hash
- **Use:** Detect file tampering

### What is AES-256?
- **Symmetric encryption algorithm**
- **Key size:** 256 bits (very secure)
- **Mode:** CBC (block cipher)
- **Use:** Encrypt files before upload
- **Decryption:** Only with correct key

### What is Smart Contract?
- **Program on blockchain**
- **Immutable:** Cannot be changed
- **Transparent:** Everyone can verify
- **Automated:** Runs automatically
- **Use:** Store & verify file hashes

### What is MetaMask?
- **Browser wallet**
- **Holds private keys**
- **Signs transactions**
- **Manages accounts**
- **Standard for Web3**

---

## 🔑 Key Files to Know

| File | What to do |
|------|-----------|
| `backend/server.js` | Main server - start here |
| `backend/public/index.html` | Frontend UI (served statically) |
| `backend/routes/fileRoutes.js` | File upload/download endpoints |
| `backend/routes/blockchainRoutes.js` | Blockchain interaction endpoints |
| `contracts/FileSecure.sol` | Smart contract logic |
| `backend/.env` | **IMPORTANT: Configure this** |

---

## 🔄 Complete Data Flow

### Upload
```
User selects file
    ↓
Calculate SHA-256 hash
    ↓
Generate random AES key
    ↓
Encrypt with AES-256
    ↓
Upload encrypted file to server
    ↓
Store hash + key on blockchain
    ↓
Return file ID to user
```

### Verify
```
User downloads file
    ↓
Calculate SHA-256 hash
    ↓
Query blockchain for original hash
    ↓
Compare hashes
    ↓
If match: ✅ Authentic
If no match: ⚠️ Tampered
    ↓
Optional: Decrypt with key
```

---

## 🛠 Common Commands

### Backend (Unified Node.js)
```bash
cd backend
npm install        # Install dependencies
npm start          # Start unified server (backend + frontend) on http://localhost:5000
npm run dev        # Start with auto-reload (requires nodemon)
```

### Git
```bash
git init           # Initialize repo
git add .          # Stage all files
git commit -m "msg" # Commit changes
git push           # Upload to GitHub
```

---

## 🔐 Security Reminders

⚠️ **NEVER COMMIT THESE:**
- `.env` file
- Private keys
- Passwords
- API keys

✅ **ALWAYS DO THIS:**
- Use `.env` for secrets
- Keep keys in secure location
- Use HTTPS in production
- Validate all inputs
- Update dependencies

---

## 🐛 Troubleshooting

### Problem: MetaMask won't connect
**Solution:** 
- Make sure MetaMask is installed
- Switch to Ganache network
- Refresh page
- Check browser console

### Problem: Port 5000 already in use
**Solution:**
- Change PORT in `.env` to 5001
- Or kill process: `lsof -i :5000` then `kill -9 <PID>`

### Problem: File upload fails
**Solution:**
- Check backend console for error
- Verify `.env` is configured
- Make sure Ganache is running
- Check file size (limit: 100MB)

### Problem: Hash mismatch
**Solution:**
- Use correct original hash
- Don't modify file between upload & verification
- Make sure blockchain query worked

---

## 📊 API Quick Reference

### File Operations
```
POST   /api/upload              Upload file
GET    /api/file/:fileId        Download file
POST   /api/verify              Verify file
GET    /api/file-metadata/:id   Get metadata
GET    /api/user-files/:addr    List user files
```

### Blockchain Operations
```
POST   /api/store-hash              Store hash on-chain
GET    /api/verify-blockchain/:hash Check hash on-chain
POST   /api/grant-access            Grant permission
GET    /api/check-access/:id/:user  Check permission
GET    /api/network-info            Get network info
```

---

## 🧠 Understanding the Code

### Architecture
- **Frontend:** Vanilla JavaScript + HTML/CSS served as static files from Express
- **Tech Stack:** CryptoJS for encryption, Web3.js for blockchain interaction
- **Served from:** `backend/public/index.html`

### Backend Route Structure
```
server.js (Express setup)
├── public/ (Serves frontend)
├── fileRoutes.js (File management)
└── blockchainRoutes.js (Blockchain calls)
```

### Smart Contract Structure
```
FileSecure.sol
├── Core Functions (upload, verify)
├── Access Control (grant, revoke)
├── Queries (hasAccess, getDetails)
└── Events (logging)
```

---

## 📖 Documentation Map

```
Want to...                  Read...
─────────────────────────────────────────────────
Understand project          → README.md
Set up locally              → SETUP_GUIDE.md
See what's done             → COMPLETION_CHECKLIST.md
Understand design           → ARCHITECTURE.md
See future plans            → ROADMAP.md
Know technical details      → TECHNICAL_SPECS.md
Get this guide              → QUICK_REFERENCE.md
```

---

## 🎯 Next Steps After Setup

1. **Understand the code**
   - Read ARCHITECTURE.md
   - Review smart contract
   - Trace data flow

2. **Customize the system**
   - Change colors in CSS
   - Add your company logo
   - Custom messages

3. **Add features**
   - User authentication
   - File sharing
   - Analytics dashboard

4. **Deploy**
   - Cloud hosting
   - Production blockchain
   - IPFS integration

---

## 🔗 Useful Links

- **MetaMask:** https://metamask.io
- **Ganache:** https://www.trufflesuite.com/ganache
- **Remix IDE:** https://remix.ethereum.org
- **Ethereum Docs:** https://ethereum.org/developers
- **Solidity Docs:** https://docs.soliditylang.org
- **Web3.js:** https://web3js.readthedocs.io
- **Ethers.js:** https://docs.ethers.io

---

## 💡 Pro Tips

1. **Use VS Code Extensions:**
   - Solidity (for smart contracts)
   - Thunder Client (for API testing)
   - GitKraken (for git management)

2. **Test Locally First:**
   - Use Ganache before Sepolia
   - Test with small files first
   - Check gas costs on testnet

3. **Keep It Secure:**
   - Never share private keys
   - Use different keys per environment
   - Rotate keys periodically

4. **Performance Tips:**
   - Cache hash calculations
   - Batch file operations
   - Use pagination for lists

5. **Development Workflow:**
   - Make small commits
   - Test after each change
   - Keep a changelog

---

**Last Updated:** February 17, 2026  
**Version:** 2.0 (Unified Node.js Backend + Vanilla JS Frontend)
