import React, { useState } from 'react';
import { encryptFile, calculateHash } from '../utils/crypto';
import axios from 'axios';
import '../styles/FileUpload.css';

function FileUpload({ userAddress, provider, contract, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState(0); // 0=ready, 1=hashing, 2=encrypting, 3=uploading, 4=blockchain, 5=complete
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccessData, setUploadSuccessData] = useState(null);

  // Supports local dev and production: use REACT_APP_API_BASE if set, else default to same-origin /api
  const API_BASE = process.env.REACT_APP_API_BASE || '/api';

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

  const validateFile = (selectedFile) => {
    if (!selectedFile) return null;

    if (selectedFile.size > MAX_FILE_SIZE) {
      return `❌ File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    // Allow all file types for now, but log unsupported types
    console.log(`File type: ${selectedFile.type}`);

    return null; // File is valid
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const error = validateFile(selectedFile);
      if (error) {
        setMessage(error);
        setMessageType('error');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
      setUploadStep(0);
      setUploadSuccessData(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const error = validateFile(droppedFile);
      if (error) {
        setMessage(error);
        setMessageType('error');
        setFile(null);
        return;
      }
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setMessage('');
      setUploadStep(0);
      setUploadSuccessData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      setMessageType('error');
      return;
    }

    if (!userAddress) {
      setMessage('❌ Please connect your wallet first');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setUploadStep(1);
    setUploadProgress(0);

    try {
      // Step 1: Encrypt file using wallet-derived key
      setMessage('🔒 Encrypting file...');
      setUploadStep(1);
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const encryptedData = await encryptFile(file, userAddress, fileId);
      console.log('File encrypted with wallet-derived key');
      setUploadProgress(25);

      // Step 2: Calculate hash of ENCRYPTED file (for verification)
      setUploadStep(2);
      setMessage('📊 Calculating encrypted file hash...');
      const encryptedBlob = new Blob([encryptedData.encryptedFile], { type: 'application/octet-stream' });
      const encryptedFileHash = await calculateHash(encryptedBlob);
      console.log('Encrypted File Hash:', encryptedFileHash);
      setUploadProgress(50);

      // Step 3: Prepare FormData for upload
      setUploadStep(3);
      setMessage('☁️ Uploading encrypted file...');
      const formData = new FormData();
      formData.append('file', encryptedBlob);
      formData.append('fileName', fileName);
      formData.append('owner', userAddress);
      formData.append('fileHash', encryptedFileHash);
      formData.append('fileId', fileId);

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = 50 + Math.round((progressEvent.loaded * 25) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      console.log('Backend upload response:', response.data);
      setUploadProgress(75);

      // Step 4: Register on blockchain if enabled
      if (contract) {
        setUploadStep(4);
        setMessage('⛓️ Registering on blockchain...');
        const tx = await contract.uploadFile(fileId, encryptedFileHash);
        await provider.waitForTransaction(tx.hash);
        console.log('File registered on blockchain with ID', fileId);
      }

      setUploadProgress(100);
      setUploadStep(5);
      
      const successData = { fileId, fileName, owner: userAddress, hash: encryptedFileHash, encryptionKey: encryptedData.key };
      setUploadSuccessData(successData);
      setMessage(`✅ File uploaded successfully!\nFile ID: ${fileId}\nHash: ${encryptedFileHash}\nEncryption Key: ${encryptedData.key}`);
      setMessageType('success');

      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess(successData);
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setFile(null);
        setFileName('');
        setUploadProgress(0);
        setUploadStep(0);
      }, 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(`❌ Error: ${err.message || 'Upload failed'}`);
      setMessageType('error');
      setUploadStep(0);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step) => {
    if (uploadStep > step) return '✓';
    if (uploadStep === step) return '⏳';
    return '○';
  };

  return (
    <div className="file-upload-container">
      <div className="upload-card">
        <h3>📤 Upload & Encrypt File</h3>

        <div 
          className={`file-input-wrapper ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileInput"
            onChange={handleFileSelect}
            disabled={loading}
            className="file-input"
          />
          <label htmlFor="fileInput" className="file-label">
            {fileName ? (
              <>
                <span className="file-icon">📄</span>
                <span className="file-name">{fileName}</span>
              </>
            ) : (
              <>
                <span className="drag-icon">📁</span>
                <span>Drag & drop your file here, or click to select</span>
              </>
            )}
          </label>
        </div>

        {file && (
          <div className="file-info">
            <div className="info-item">
              <span className="label">📄 File Name:</span>
              <span className="value">{file.name}</span>
            </div>
            <div className="info-item">
              <span className="label">📊 Size:</span>
              <span className="value">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
            <div className="info-item">
              <span className="label">✓ Status:</span>
              <span className="value" style={{color: '#38ef7d'}}>Ready to upload</span>
            </div>
          </div>
        )}

        {loading && uploadStep > 0 && (
          <div className="upload-progress">
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="progress-text">{uploadProgress}% Complete</p>
            
            <div className="steps-indicator">
              <div className="step">
                <span className="step-number">{getStepStatus(1)}</span>
                <span className="step-label">Hash</span>
              </div>
              <div className="step">
                <span className="step-number">{getStepStatus(2)}</span>
                <span className="step-label">Encrypt</span>
              </div>
              <div className="step">
                <span className="step-number">{getStepStatus(3)}</span>
                <span className="step-label">Upload</span>
              </div>
              {contract && (
                <div className="step">
                  <span className="step-number">{getStepStatus(4)}</span>
                  <span className="step-label">Blockchain</span>
                </div>
              )}
            </div>
          </div>
        )}

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {uploadSuccessData && (
          <div className="success-details">
            <h4>📋 Upload Details</h4>
            <div className="detail-row">
              <span className="detail-label">File ID:</span>
              <code className="detail-value">{uploadSuccessData.fileId}</code>
            </div>
            <div className="detail-row">
              <span className="detail-label">Encryption Key:</span>
              <code className="detail-value">{uploadSuccessData.encryptionKey}</code>
            </div>
            <div className="detail-row">
              <span className="detail-label">Hash:</span>
              <code className="detail-value">{uploadSuccessData.hash}</code>
            </div>
          </div>
        )}

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? (
            <>
              <span className="btn-loader">⏳</span>
              {uploadStep === 1 && 'Calculating Hash...'}
              {uploadStep === 2 && 'Encrypting...'}
              {uploadStep === 3 && 'Uploading...'}
              {uploadStep === 4 && 'Registering...'}
              {uploadStep === 0 && 'Processing...'}
            </>
          ) : (
            <>🚀 Upload & Encrypt</>
          )}
        </button>

        <div className="process-info">
          <h4>🔒 Security Process:</h4>
          <ul>
            <li><span className="step-dot">1</span> <strong>Hash Calculation:</strong> SHA-256 fingerprint of original file</li>
            <li><span className="step-dot">2</span> <strong>Encryption:</strong> AES-256-GCM with wallet-derived key</li>
            <li><span className="step-dot">3</span> <strong>Upload:</strong> Encrypted file stored securely</li>
            <li><span className="step-dot">4</span> <strong>Blockchain:</strong> Hash registered for verification</li>
            <li><span className="step-dot">5</span> <strong>Safe:</strong> Only you can decrypt with your wallet</li>
          </ul>
        </div>

        <div className="file-requirements">
          <h4>📋 Requirements:</h4>
          <ul>
            <li>✓ Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB</li>
            <li>✓ Wallet must be connected</li>
            <li>✓ Any file type supported</li>
            <li>✓ Files are encrypted end-to-end</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
