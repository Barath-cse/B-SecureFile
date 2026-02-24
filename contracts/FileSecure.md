# BlockSecure Smart Contract - FileSecure.sol

## Contract Overview

The `FileSecure` contract is a blockchain-based file integrity and access control system built on Ethereum. It enables users to:

1. Register file hashes on the blockchain
2. Verify file integrity using stored hashes
3. Manage file access permissions
4. Track file ownership and modification history

## Key Features

### 1. File Registration
- Store SHA-256 hash of files on blockchain
- Record file owner and upload timestamp
- Prevent duplicate hash registration

### 2. Integrity Verification
- Verify if a file hash exists on blockchain
- Compare downloaded file hash with blockchain record
- Detect tampering automatically

### 3. Access Control
- Implement permission-based file access
- Owner can grant/revoke access to other users
- Automatic access for file owner

### 4. File Metadata
- Store owner address
- Record timestamp of upload
- Retrieve file details on-demand

## Contract Functions

### uploadFile(string _fileHash)
Uploads a file hash to the blockchain.

**Parameters:**
- `_fileHash`: SHA-256 hash of the file

**Events:** `FileUploaded`

```solidity
// Example
contract.uploadFile("abc123def456...");
```

### verifyFile(string _fileHash) → bool
Checks if a file hash exists on blockchain.

**Parameters:**
- `_fileHash`: Hash to verify

**Returns:** `true` if file exists, `false` otherwise

```solidity
// Example
bool exists = contract.verifyFile("abc123def456...");
```

### getFileDetails(string _fileHash) → (string, address, uint256)
Retrieves complete file metadata.

**Parameters:**
- `_fileHash`: File hash to query

**Returns:**
- `fileHash`: The file hash
- `owner`: Owner's wallet address
- `timestamp`: Upload time (Unix timestamp)

### grantAccess(string _fileHash, address _userAddress)
Grants file access to another user (owner only).

**Parameters:**
- `_fileHash`: File hash
- `_userAddress`: Address to grant access to

**Events:** `AccessGranted`

```solidity
// Example
contract.grantAccess("abc123def456...", "0x742d35Cc6634C0532925a3b844Bc9e7595f...");
```

### revokeAccess(string _fileHash, address _userAddress)
Revokes file access from a user (owner only).

**Parameters:**
- `_fileHash`: File hash
- `_userAddress`: Address to revoke access from

**Events:** `AccessRevoked`

### hasAccess(string _fileHash, address _userAddress) → bool
Checks if a user has access to a file.

**Parameters:**
- `_fileHash`: File hash
- `_userAddress`: User's address

**Returns:** `true` if user has access, `false` otherwise

### getAccessList(string _fileHash) → address[]
Retrieves all addresses with access to a file.

**Parameters:**
- `_fileHash`: File hash

**Returns:** Array of addresses with access

### getAccessCount(string _fileHash) → uint256
Gets the number of users with access to a file.

**Parameters:**
- `_fileHash`: File hash

**Returns:** Number of addresses with access

## Events

### FileUploaded
```solidity
event FileUploaded(
    string indexed fileHash,
    address indexed owner,
    uint256 timestamp
);
```

### AccessGranted
```solidity
event AccessGranted(
    string indexed fileHash,
    address indexed grantedTo,
    address indexed grantedBy
);
```

### AccessRevoked
```solidity
event AccessRevoked(
    string indexed fileHash,
    address indexed revokedFrom,
    address indexed revokedBy
);
```

## Deployment

### Using Remix IDE

1. Open https://remix.ethereum.org
2. Create new file: `FileSecure.sol`
3. Copy contract code
4. Select compiler version: `^0.8.0`
5. Click "Compile"
6. Click "Deploy"
7. Connected wallet will execute deployment
8. Copy contract address after deployment

### Using Hardhat (Advanced)

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network ganache
```

## Testing the Contract

### Using Remix

1. After deployment, interact with contract functions
2. Call `uploadFile("test_hash_123")`
3. Call `verifyFile("test_hash_123")` - should return true
4. Call `grantAccess("test_hash_123", "0x...")`
5. Call `hasAccess("test_hash_123", "0x...")` - should return true
6. Call `revokeAccess("test_hash_123", "0x...")`
7. Call `hasAccess("test_hash_123", "0x...")` - should return false

### Use Cases

#### Scenario 1: Upload & Verify
1. User uploads file and calculates SHA-256 hash
2. Smart contract stores hash via `uploadFile()`
3. Later, user downloads file and verifies hash
4. Call `verifyFile()` to check blockchain record
5. Compare: if hashes match → file is authentic

#### Scenario 2: Share File
1. Alice uploads file → calls `uploadFile()`
2. Alice grants access to Bob → calls `grantAccess()`
3. Bob checks access → calls `hasAccess()`
4. Bob can download and verify file

#### Scenario 3: Detect Tampering
1. File stored on blockchain with hash: "abc123"
2. Hacker modifies file → hash changes to "xyz789"
3. User verifies file → gets "xyz789"
4. Call `verifyFile("xyz789")` → returns false (not on blockchain)
5. Tampering detected!

## Security Considerations

- Function visibility: State-changing functions check ownership
- Input validation: Empty hashes are rejected
- No double registration: Same hash cannot be registered twice
- Access control: Only owner can manage permissions
- Immutability: Registered hashes cannot be modified
- Event logging: All actions emit events for audit trail

## Gas Optimization

- Use string hashing for file identification
- Mapping lookups for O(1) access checks
- Array storage for access lists (allows enumeration)

## Future Enhancements

- [ ] Support multiple file versions
- [ ] Implement expiring access permissions
- [ ] Add file deletion functionality
- [ ] Implement recovery systems
- [ ] Multi-signature access control
- [ ] Integration with IPFS
