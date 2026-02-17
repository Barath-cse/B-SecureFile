# BlockSecure Encryption and Decryption Tutorial

Welcome to BlockSecure! This tutorial will guide you through encrypting and decrypting files using our blockchain-based secure file system. BlockSecure uses AES-256 encryption to protect your files and stores file integrity hashes on the blockchain for tamper detection.

## Prerequisites
- Install MetaMask browser extension and set up a wallet.
- Ensure the BlockSecure application is running (frontend on http://localhost:3000, backend on http://localhost:5000).
- Connect to a test network like Sepolia (not mainnet for testing).

## Step 1: Connect Your Wallet
1. Open the BlockSecure website in your browser.
2. Click the "Connect Wallet" button.
3. MetaMask will prompt you to connect. Approve the connection.
4. Your wallet address will appear, confirming you're connected.

## Step 2: Encrypt and Upload a File
Encryption happens automatically when you upload a file. Here's how:

1. **Select the Upload Tab**: Click on the "Upload File" tab in the app.
2. **Choose a File**: Click "Choose File" and select the file you want to encrypt (e.g., a document or image).
3. **Enter Encryption Key**: Provide a strong, unique key (at least 16 characters) for AES-256 encryption. Remember this key—you'll need it to decrypt later.
4. **Upload**: Click "Upload". The app will:
   - Encrypt the file locally using your key.
   - Calculate a SHA-256 hash of the encrypted file.
   - Upload the encrypted file to the server (IPFS recommended).
   - Store the hash on the blockchain via a smart contract.
5. **Confirmation**: You'll see a success message with the file hash stored on the blockchain. Note the file name and hash for verification.

**Security Note**: Never share your encryption key. The file is encrypted before leaving your device, so only you control access.

## Step 3: Decrypt and Verify a File
To access and verify a previously uploaded file:

1. **Select the Verify Tab**: Click on the "Verify File" tab.
2. **Enter File Details**:
   - File Name: Enter the name of the uploaded file.
   - Blockchain Hash: Paste the hash from the upload confirmation.
   - Encryption Key: Enter the same key used during upload.
3. **Download and Verify**: Click "Verify File". The app will:
   - Download the encrypted file from the server.
   - Decrypt it locally using your key.
   - Recalculate the hash and compare it to the blockchain-stored hash.
4. **Result**:
   - If hashes match: The file is authentic and untampered. You'll see the decrypted content.
   - If hashes don't match: Tampering detected—do not trust the file.
5. **Save the File**: If verified, save the decrypted file to your device.

**Troubleshooting**:
- Wrong key? Decryption will fail—ensure you use the exact key.
- Network issues? Check your MetaMask connection and blockchain network.
- File not found? Verify the file name and ensure the server is running.

## Key Concepts
- **Encryption**: Protects file content using AES-256, making it unreadable without the key.
- **Hashing**: SHA-256 creates a unique fingerprint of the file, stored immutably on the blockchain.
- **Blockchain Verification**: Ensures integrity—any changes to the file will alter the hash, alerting you to tampering.
- **Decentralized Storage**: Files are stored on IPFS, not controlled by any single server.

## Best Practices
- Use strong, unique keys for each file.
- Back up your encryption keys securely (e.g., password manager).
- Test with small files first on testnets.
- For real use, deploy to mainnet and use production IPFS gateways.

If you encounter issues, check the console for errors or refer to the SETUP_GUIDE.md. Happy securing!</content>
<parameter name="filePath">c:\Users\Ragul\Desktop\B-SecureFile\docs\ENCRYPTION_TUTORIAL.md