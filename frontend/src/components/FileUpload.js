import React, { useState } from 'react';
import { encryptFile, calculateHash } from '../utils/crypto';
import axios from 'axios';
import '../styles/FileUpload.css';

function FileUpload({ userAddress, provider, contract }) {
  // when blockchain is disabled the parent may not pass contract/provider
  const useBlockchain = contract && provider;
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('Processing file...');
    setMessageType('');

    try {
      // Step 1: Calculate file hash before encryption
      const originalHash = await calculateHash(file);
      console.log('Original Hash:', originalHash);
      setMessage(`Hash calculated: ${originalHash.slice(0, 10)}...`);

      // Step 2: Encrypt file
      setMessage('Encrypting file...');
      const encryptedData = await encryptFile(file);
      console.log('File encrypted');

      // Step 3: Prepare FormData for upload
      setMessage('Uploading encrypted file...');
      const formData = new FormData();
      formData.append('file', new Blob([encryptedData.encryptedFile], { type: 'application/octet-stream' }));
      formData.append('fileName', fileName);
      formData.append('owner', userAddress);
      formData.append('fileHash', originalHash);
      formData.append('encryptionKey', encryptedData.key);

      // Step 4: Upload to backend
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      console.log('Backend upload response:', response.data);

      // File hash and encryption key are stored in backend
      // Access control (grant/revoke) can be managed separately without uploading every file to blockchain
      setMessage(`✅ File uploaded successfully!\nHash: ${originalHash}\nKey: ${encryptedData.key}`);
      setMessageType('success');

      // Reset form
      setFile(null);
      setFileName('');
      setUploadProgress(0);
    } catch (err) {
      const errorMsg = err.message || err.toString();
      console.error('Upload error:', err);
      setMessage(`❌ Error: ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="upload-card">
        <h3>Upload & Encrypt File</h3>

        <div className="file-input-wrapper">
          <input
            type="file"
            id="fileInput"
            onChange={handleFileSelect}
            disabled={loading}
            className="file-input"
          />
          <label htmlFor="fileInput" className="file-label">
            {fileName || '📁 Select a file to upload'}
          </label>
        </div>

        {file && (
          <div className="file-info">
            <p><strong>File:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            <p className="progress-text">{uploadProgress}%</p>
          </div>
        )}

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? 'Processing...' : '🚀 Upload & Encrypt'}
        </button>

        <div className="process-info">
          <h4>What happens:</h4>
          <ul>
            <li>📊 Calculate SHA-256 file hash</li>
            <li>🔒 Encrypt file with AES-256</li>
            <li>☁️ Upload to IPFS/Server</li>
            <li>⛓️ Store hash on blockchain</li>
            <li>✅ Get encryption key for later decryption</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
