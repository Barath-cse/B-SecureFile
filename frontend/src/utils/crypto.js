import CryptoJS from 'crypto-js';

// Generate Random Key for AES encryption
export const generateEncryptionKey = () => {
  return CryptoJS.lib.WordArray.random(256 / 8).toString();
};

// Calculate SHA-256 hash of a file
export const calculateHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(content));
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Encrypt file with AES-256
export const encryptFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const encryptionKey = generateEncryptionKey();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(content));
        
        // Encrypt the file
        const encrypted = CryptoJS.AES.encrypt(
          wordArray,
          encryptionKey,
          {
            format: CryptoJS.format.OpenSSL
          }
        );

        resolve({
          encryptedFile: encrypted.toString(),
          key: encryptionKey
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Decrypt file with AES-256
export const decryptFile = (encryptedFile, encryptionKey) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const encryptedContent = e.target.result;
        
        // Convert to string if it's ArrayBuffer
        let encryptedString = '';
        if (encryptedContent instanceof ArrayBuffer) {
          encryptedString = new TextDecoder().decode(encryptedContent);
        } else {
          encryptedString = encryptedContent;
        }

        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(
          encryptedString,
          encryptionKey,
          {
            format: CryptoJS.format.OpenSSL
          }
        );

        // Convert to string
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedString) {
          reject(new Error('Decryption failed: Invalid key or corrupted data'));
        } else {
          resolve(decryptedString);
        }
      } catch (err) {
        reject(new Error('Decryption error: ' + err.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsArrayBuffer(encryptedFile);
  });
};

// Hash password for user authentication
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Verify password
export const verifyPassword = (password, hash) => {
  return CryptoJS.SHA256(password).toString() === hash;
};

// Generate random token
export const generateToken = () => {
  return CryptoJS.lib.WordArray.random(32).toString();
};
