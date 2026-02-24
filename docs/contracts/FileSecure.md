# FileSecure Smart Contract

Solidity contract used to record file hashes and manage access permissions.

## Events
- `FileUploaded(uint indexed fileId, string hash, address indexed owner)`
- `AccessGranted(uint indexed fileId, address indexed user)`

## Functions

### uploadFile(string _hash)
- **Visibility**: external
- **Description**: Register a new file hash on-chain; emits `FileUploaded`.
- **Parameters**:
  - `_hash`: SHA-256 hash of the file as a hex string.

### verifyFile(string _hash) → bool
- **Visibility**: external view
- **Returns**: `true` if any stored file matches the given hash.

### grantAccess(uint fileId, address user)
- **Visibility**: external
- **Requirements**: Caller must be the owner of the file.
- **Description**: Grants the specified address permission to access the file.
- **Emits**: `AccessGranted`.

### hasAccess(uint fileId, address user) → bool
- **Visibility**: external view
- **Returns**: Whether `user` has been granted access to `fileId`.

### getFileDetails(uint fileId) → (string, address)
- **Visibility**: external view
- **Returns**: The file's hash and owner address.

## Storage
- `uint public fileCount;`
- `mapping(uint => File) public files;`
- `mapping(uint => mapping(address => bool)) public access;`

## Structs
```
struct File {
    string hash;
    address owner;
}
```

Compile with `pragma solidity ^0.8.0`.
