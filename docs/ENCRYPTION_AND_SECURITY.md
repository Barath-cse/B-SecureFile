# Encryption & Security Guide

Comprehensive guide to understanding encryption, security measures, and real-world usage scenarios in BlockSecure.

---

## Table of Contents
1. [Encryption Overview](#encryption-overview)
2. [Key Generation](#key-generation)
3. [File Encryption Process](#file-encryption-process)
4. [File Decryption Process](#file-decryption-process)
5. [Hash Verification](#hash-verification)
6. [Security Guarantees](#security-guarantees)
7. [Real-World Scenarios](#real-world-scenarios)
8. [Security Best Practices](#security-best-practices)

---

## Encryption Overview

BlockSecure uses **AES-256 encryption** to protect file confidentiality and **SHA-256 hashing** to ensure integrity.

### Why AES-256?
- Military-grade security standard
- 256-bit key = $2^{256}$ possible combinations (computationally infeasible to brute-force)
- Fast enough for real-time use
- Widely supported and audited

### Why SHA-256?
- Produces 256-bit (32-byte) hash from any file size
- One-way function (impossible to reverse)
- Deterministic (same file = same hash, always)
- Collision-resistant (extremely rare to have same hash for different files)

---

## Key Generation

### How Keys Are Generated

```javascript
generateEncryptionKey() {
  // Generate 32 random bytes (256 bits)
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  
  // Convert to hex string (64 characters)
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Result: "a1b2c3d4e5f6g7h8..." (unique for every file)
```

### Key Characteristics
- **Length**: 256 bits (64 hex characters) = cryptographically strong
- **Randomness**: Generated using browser's secure random number generator
- **Uniqueness**: Each upload generates a NEW key
- **Storage**: Key is provided to user immediately (not stored in blockchain)

### Key Management Best Practices
1. **Keep keys separate from files** (never send both together)
2. **Use secure channels** for key transmission (encrypted email, phone call, secure messenger)
3. **Store securely** (password manager, encrypted note-taking app)
4. **Never share with untrusted parties** (key provides full access to decrypted content)
5. **Lose the key = lose the file** (no recovery without key)

---

## File Encryption Process

### Step-by-Step Encryption (Browser-Side)

```
User selects file "lawsuit.pdf"
    ↓
Generate random AES-256 key: "a1b2c3..."
    ↓
Read file into memory as bytes
    ↓
Encrypt bytes using: AES(key, file_bytes)
    ↓
Result: [encrypted bytes] (gibberish: \x83\xd4\x92...)
    ↓
Calculate hash: SHA256(encrypted_bytes)
    ↓
Result: 0x5f3e7a2c9d1b4e8f... (64-char hex string)
    ↓
Send to backend:
  {
    file: [encrypted bytes],
    encryptionKey: "a1b2c3...",
    fileName: "lawsuit.pdf",
    owner: "0xLawyer123..."
  }
```

### Why Encryption Happens in Browser?
1. **Privacy**: File never exists unencrypted on network or server
2. **Server can't read**: Even backend admin can't access file content
3. **Control**: User maintains full control over key
4. **Security**: No key transmission risk (key generated and stays on device initially)

### What Gets Stored Where

| Item | Location | Readable By | Purpose |
|------|----------|-------------|---------|
| Encrypted file | Backend disk | No one (requires key) | Storage |
| Encryption key | User's device | Only file owner | Decryption |
| Hash | Blockchain | Everyone | Proof of authenticity |
| Filename | Backend memory | Backend admin | File reference |
| Owner address | Blockchain | Everyone | Permission enforcement |

---

## File Decryption Process

### Browser-Side Decryption

```
User downloads encrypted file
    ↓
User provides encryption key: "a1b2c3..."
    ↓
Frontend loads both:
  - Encrypted file (from download)
  - Encryption key (from user input)
    ↓
Decrypt: AES_decrypt(key, encrypted_bytes)
    ↓
Result: Original file content (readable PDF/image/text)
    ↓
User can:
  - View in browser
  - Download decrypted version
  - Calculate hash for verification
```

### Why Decryption in Browser?
1. **Security**: Decrypted content never sent to server
2. **Privacy**: Server never sees unencrypted file
3. **Performance**: No server processing needed
4. **Verification**: User controls the verification process

---

## Hash Verification

### File Integrity Verification Process

```
User downloads encrypted file
    ↓
User provides:
  - Encryption key
  - Original blockchain hash (0x5f3e...)
    ↓
Frontend:
  1. Decrypt file using key
  2. Calculate SHA-256 hash of decrypted content
  3. Compare with blockchain hash
    ↓
If hashes MATCH:
  ✅ File is AUTHENTIC (not modified)
  ✅ Hash on blockchain = hash now
    ↓
If hashes DON'T MATCH:
  ⚠️ File is TAMPERED (modified after upload)
  ✅ Attacker can be detected
```

### What Hash Proves
- ✅ **Integrity**: File hasn't been modified
- ✅ **Authenticity**: This is the exact file that was uploaded
- ✅ **Timestamp**: Blockchain proves when hash was recorded
- ❌ **Does NOT prove**: Confidentiality (only encryption does that)

### Hash Collision Probability
**Likelihood of two different files having same SHA-256 hash**: 1 in 2^256  
**For reference**: 2^256 ≈ more atoms than in the observable universe  
**Practical conclusion**: Impossible to find collision by accident or design

---

## Security Guarantees

### 1. Confidentiality (via Encryption)

**Threat**: Attacker steals encrypted file from server

**Protection**:
```
Without key:  [encrypted bytes] = unreadable gibberish
With key:     [decrypted bytes] = original content
```

**Result**: ✅ Even if server is breached, files are unreadable

**Strength**: AES-256 = cryptographically secure  
**Effort to crack**: 2^256 operations (impossible with current technology)

### 2. Integrity (via Hashing)

**Threat**: Attacker modifies encrypted file after upload

**Protection**:
```
Modified file hash ≠ blockchain hash
Verification fails
Alert: File was tampered!
```

**Result**: ✅ Any modification is instantly detected

**How it works**:
- Even 1-bit change in file completely changes hash
- Hashes stored on immutable blockchain
- Cannot change hash without re-uploading

### 3. Authenticity (via Blockchain Timestamp)

**Threat**: Attacker claims they uploaded file at different time

**Protection**:
```
Blockchain records:
  - Hash
  - Owner address
  - Block number (timestamp)
  - Transaction ID
  
All permanently immutable
```

**Result**: ✅ Proof of who uploaded, what, and when

### 4. Authorization (via Smart Contract)

**Threat**: Unauthorized user verifies file

**Protection**:
```
Before verification:
  Check: hasAccess(fileId, userAddress)?
  
If false:
  Deny access
  User cannot verify even with key
```

**Result**: ✅ Only explicit grantees can verify

**Note**: User can still possess the key/file locally, but cannot prove legitimacy through BlockSecure

### 5. Non-Repudiation (via Blockchain)

**Threat**: User denies they uploaded/granted access

**Protection**:
```
Blockchain transaction:
  - Transaction hash: Permanent record
  - From address: Who initiated
  - To contract: Smart contract address
  - Function: uploadFile/grantAccess
  - Timestamp: When it happened
  
Cannot be deleted or modified
```

**Result**: ✅ Cannot deny any action recorded on-chain

---

## Real-World Scenarios

### Scenario 1: Legal Document Sharing

#### Day 1, 10:00 AM — Lawyer Uploads Contract

**Step 1: File Selection**
- Lawyer selects: `Settlement_Agreement.pdf`
- Size: 2.5 MB
- Contains: Confidential settlement terms

**Step 2: Encryption**
- Frontend generates key: `a1b2c3d4e5f6g7h8...`
- Encrypts 2.5 MB file using AES-256
- Resulting encrypted file: Still 2.5 MB (size unchanged)
- Unique encryption key stored on lawyer's device

**Step 3: Upload to BlockSecure**
- Backend receives encrypted bytes
- Stores as: `/uploads/1770924129264-settlement-blob`
- Records hash: `0x5f3e7a2c9d1b4e8f...`

**Step 4: Blockchain Recording**
- Smart contract: `uploadFile(0x5f3e7a2c9d1b4e8f...)`
- Blockchain records file permanently
- Transaction timestamp: Block #12345

**Step 5: Grant Access**
- Lawyer enters opposing party's address: `0xParty456...`
- Calls smart contract: `grantAccess(1, 0xParty456...)`
- Blockchain records: "Party has access"

#### Day 1, 3:00 PM — Opposing Party Receives & Verifies

**Step 1: File Transmission**
- Lawyer emails encrypted settlement file via corporate email
  - Email has TLS encryption (secure connection)
  - Encrypted file double-protected
- Lawyer emails key separately via Signal (encrypted messenger)
  - Key never touches email (which could be hacked)
  - Two separate communication channels

**Step 2: Party Downloads File**
- Party logs into BlockSecure
- Finds the file available (because access was granted on blockchain)
- Downloads encrypted settlement file

**Step 3: File Verification**
- Party opens FileVerify component
- Uploads downloaded encrypted file
- Enters encryption key from Signal message
- Enters blockchain hash from contract
- Clicks: "Verify Integrity"

**Step 4: Verification Result**
```
Frontend calculations:
  1. Decrypt file with provided key
     Result: Readable PDF content
  
  2. Calculate hash of decrypted content
     Result: 0x5f3e7a2c9d1b4e8f...
  
  3. Compare with blockchain hash
     Blockchain: 0x5f3e7a2c9d1b4e8f...
     Calculated: 0x5f3e7a2c9d1b4e8f...
     
  4. Result: ✅ MATCH!

Screen shows:
  ✅ File is AUTHENTIC!
  ✅ File hash matches blockchain record.
  ✅ Signed by: 0xLawyer123...
  ✅ Verified at: Block #12345 on 2026-02-24
```

**Step 5: Legal Proof**
- Party can now prove:
  - They possess authentic settlement document
  - Document existed since Block #12345
  - Lawyer signed it (address 0xLawyer123...)
  - Content hasn't been modified
  - Proof is cryptographically verified

#### Later: Access Revocation

**Day 30: Settlement Dispute Emerges**
- Lawyer decides party should no longer have verification rights
- Lawyer calls: `revokeAccess(1, 0xParty456...)`
- Blockchain updates: Access = false

**Day 31: Access Denied**
- Party tries to verify again
- BlockSecure checks: `hasAccess(1, 0xParty456...)`
- Blockchain returns: false
- Screen shows: ❌ Access Denied

**Security Note**: Party still HAS the encrypted file and key locally, but cannot use BlockSecure to verify. This prevents them from proving legitimacy publicly through the platform.

### Scenario 2: Intellectual Property Protection

**Use Case**: Startup protecting trade secrets

**Upload**: Source code portfolio (encrypted with AES-256)
- Blockchain hash proves date of creation
- Immutable timestamp for IP dispute resolution

**Sharing**: Grant access to potential investors
- They verify authenticity before investment discussion
- Cannot leak/modify without being detected
- Access can be revoked after meeting

**Protection**: If employee leaves, revoke access immediately
- They cannot prove they have the right to possess the files
- Prevents leaking to competitors

### Scenario 3: Medical Records

**Use Case**: Patient sharing records with specialist

**Upload**: Private medical records (confidential)
- Encrypted with patient-controlled key
- Hash on blockchain

**Sharing**: Grant access to specialist address
- Specialist can verify authenticity and integrity
- Cannot access without encryption key
- Blockchain timestamp proves when shared

**Revocation**: After treatment, revoke access
- Specialist cannot continue accessing through platform
- HIPAA compliance: Access control enforced

---

## Security Best Practices

### For Users

#### ✅ DO

1. **Keep encryption keys secure**
   - Store in password manager (LastPass, 1Password, Dashlane)
   - Use secure note-taking app (Notion, Obsidian, encrypted notes)
   - Write down and physically secure for critical files
   - Back up keys to secure location (encrypted USB drive)

2. **Transmit keys securely**
   - Use encrypted channels: Signal, WhatsApp, encrypted email
   - Never email key + file together
   - Use different communication channels for key vs. file
   - Verify recipient identity before sharing key

3. **Verify file hashes after download**
   - Always verify before using downloaded file
   - Ensures file wasn't modified in transit
   - Immediate detection of tampering

4. **Use different keys for different files**
   - Each upload generates unique key automatically
   - Don't reuse keys across files
   - Compromise of one key doesn't affect others

5. **Monitor access permissions**
   - Regularly check who has access
   - Revoke access immediately when no longer needed
   - Keep audit trail of access grants/revokes

#### ❌ DON'T

1. **Email file + key in same message**
   - If email is hacked, attacker gets both
   - Same security as sending unencrypted file

2. **Lose or forget encryption keys**
   - No recovery mechanism exists
   - Lost key = permanently unrecoverable file

3. **Share keys with untrusted parties**
   - Key = full access to decrypted content
   - Trust is critical for key sharing

4. **Assume blockchain is truly private**
   - Hash is public (anyone can see who uploaded what when)
   - For truly private files, encrypt and never share hash
   - Metadata (filename, owner) is visible to users with access

5. **Rely solely on BlockSecure for security**
   - Defense in depth: encryption + blockchain + access control + backups
   - Use multiple security layers
   - Regular security audits recommended

### For Developers/Operators

1. **Keep backend `.env` secure**
   - Never commit to git
   - Use secure environment variable management
   - Rotate keys regularly

2. **Monitor smart contract events**
   - Watch for suspicious access patterns
   - Alert on unusual activity
   - Implement rate limiting

3. **Regular backups**
   - Encrypted files must be backed up
   - Test restoration regularly
   - Geographic redundancy recommended

4. **Security audits**
   - Professional smart contract audit before mainnet
   - Regular penetration testing
   - Code review for encryption implementations

5. **Monitoring and alerting**
   - Application error monitoring (Sentry)
   - Blockchain transaction monitoring
   - Uptime monitoring
   - Alert on critical failures

---

## Cryptographic Assumptions

### Security Assumptions

These assumptions must remain true for BlockSecure to be secure:

1. **AES-256 is secure**
   - No practical attacks known
   - Mathematically sound
   - Industry standard

2. **SHA-256 has no collisions**
   - No two files produce same hash
   - This is cryptographically guaranteed

3. **Blockchain is immutable**
   - Historical transactions cannot be changed
   - Distributed consensus ensures immutability
   - Proof-of-Work (or Proof-of-Stake) prevents modification

4. **User keeps encryption key private**
   - Key is not stolen
   - Key is not shared with adversary
   - Key is securely stored

5. **Private keys (for blockchain transactions) are secure**
   - Not stolen or exposed
   - Used only by authorized person
   - Backed up securely

### When Security Fails

**If encryption key is compromised**:
- Attacker can decrypt files
- Blockchain hash cannot protect (hash doesn't secret)
- Revocation on blockchain doesn't matter (attacker has key + file)
- **Prevention**: Protect keys at all costs

**If blockchain is somehow altered** (extremely unlikely):
- Historical hashes could be changed
- New files could be added/deleted
- Entire history could be modified
- **Prevention**: Use established blockchains (Ethereum) with thousands of validators

**If there's a hash collision** (mathematically impossible):
- Two different files could have same hash
- Verification would pass for different file
- File integrity guarantee breaks
- **Prevention**: SHA-256 is cryptographically sound; use it correctly

---

## Conclusion

BlockSecure provides:
- **Confidentiality** through AES-256 encryption
- **Integrity** through SHA-256 hashing
- **Authenticity** through blockchain timestamping
- **Authorization** through smart contract access control
- **Non-repudiation** through immutable on-chain records

When used correctly with proper key management and secure transmission practices, BlockSecure provides enterprise-grade security for sensitive file sharing.
