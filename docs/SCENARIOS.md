# Scenarios

## 1. Upload and Verify
1. User connects wallet and selects a file.
2. File is encrypted and hashed.
3. Backend stores file and metadata; hash is sent to smart contract.
4. Another user (or same user later) downloads file and provides hash to verify.

## 2. Granting Access
1. Owner uploads file and receives file ID.
2. Owner calls grant access function via frontend, providing file ID and recipient address.
3. Recipient can then download/verify the file when logged in with their wallet.

## 3. Lost Encryption Key
- If the encryption key is lost, the file cannot be decrypted even if the hash matches.
- The system provides no recovery mechanism by design.

## 4. Tamper Detection
- If a file downloaded from storage has been modified, its hash will differ from the on-chain record.
- Verification will fail, alerting the user to potential tampering.
