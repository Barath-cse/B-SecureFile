import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { calculateHash } from '../utils/crypto';
import '../styles/FileVerify.css';

function FileVerify({ userAddress, contract }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [fileId, setFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [verifyStep, setVerifyStep] = useState(0); // 0=ready, 1=hashing, 2=verifying, 3=result
  const [dragActive, setDragActive] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [sharedKeys, setSharedKeys] = useState([]);
  const [showSharedKeys, setShowSharedKeys] = useState(false);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [calculatedFileHash, setCalculatedFileHash] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Supports local dev and production: use REACT_APP_API_BASE if set, else default to same-origin /api
  const API_BASE = process.env.REACT_APP_API_BASE || '/api';

  // Persist current tab on refresh to avoid WalletConnect redirect
  React.useEffect(() => {
    sessionStorage.setItem('lastTab', 'verify');
    return () => {
      // Cleanup - optional
    };
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
      setVerificationResult(null);
      setVerifyStep(0);
      setCalculatedFileHash(''); // Clear previous hash
      
      // Calculate and display hash immediately when file is selected
      calculateFileHashImmediate(selectedFile);
    }
  };

  const calculateFileHashImmediate = async (fileToHash) => {
    try {
      setMessage('📊 Calculating hash of selected file...');
      const hash = await calculateHash(fileToHash);
      setCalculatedFileHash(hash);
      setMessage('✓ Hash calculated! Ready to verify.', 'success');
    } catch (err) {
      console.error('Error calculating hash:', err);
      setMessage(`❌ Error calculating hash: ${err.message}`, 'error');
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
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setMessage('');
      setVerificationResult(null);
      setVerifyStep(0);
      setCalculatedFileHash(''); // Clear previous hash
      
      // Calculate and display hash immediately when file is dropped
      calculateFileHashImmediate(droppedFile);
    }
  };

  // Retrieve keys shared with current user
  const retrieveSharedKeys = async () => {
    if (!userAddress) {
      setMessage('❌ Please connect your wallet first', 'error');
      return;
    }

    setLoading(true);
    setMessage('📥 Loading shared keys...');
    try {
      const res = await fetch(`${API_BASE}/shared-keys/${userAddress}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve shared keys');
      }
      
      console.log('Shared keys response:', data);
      
      if (data && data.sharedKeysCount > 0 && data.sharedKeys && data.sharedKeys.length > 0) {
        setSharedKeys(data.sharedKeys);
        setMessage(`✓ Found ${data.sharedKeysCount} shared key(s)`, 'success');
      } else {
        setSharedKeys([]);
        setMessage('ⓘ No keys have been shared with you yet', 'info');
      }
      setShowSharedKeys(true);
    } catch (err) {
      console.error('Error retrieving shared keys:', err);
      setMessage(`❌ Failed to load shared keys: ${err.message}`, 'error');
      setSharedKeys([]);
    } finally {
      setLoading(false);
    }
  };

  // Use a shared key to auto-fill fields
  const applySharedKey = (sharedKey) => {
    setFileId(sharedKey.fileId);
    setEncryptionKey(sharedKey.encryptionKey);
    setOwnerAddress(sharedKey.ownerAddress);
    setFileDownloaded(false);
    setMessage(`✓ Shared key loaded! File ID: ${sharedKey.fileId}`, 'success');
    setShowSharedKeys(false);
  };

  // Decrypt an encrypted file blob (used when verifying downloaded encrypted files)
  
  // Commented out - no longer used (button for fetching blockchain hash was removed)
  // const fetchBlockchainHash = async () => {
  //   if (!contract) {
  //     setMessage('❌ Blockchain contract not connected. Please connect your wallet.', 'error');
  //     return;
  //   }
  //   ...
  // };

  const verifyFile = async () => {
    if (!file) {
      setMessage('❌ Please select a file to verify');
      setMessageType('error');
      return;
    }

    if (!ownerAddress.trim()) {
      setMessage('❌ Please provide the owner\'s wallet address');
      setMessageType('error');
      return;
    }

    if (!fileId.trim()) {
      setMessage('❌ Please provide the file ID from the original upload');
      setMessageType('error');
      return;
    }

    if (!ownerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setMessage('❌ Invalid owner address format');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setVerifyStep(1);

    try {
      // Step 1: Verify we have calculated hash
      if (!calculatedFileHash) {
        setMessage('❌ Hash not calculated. Please select the file again.');
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      setMessage('📊 Calculating file hash...');
      setVerifyStep(2);

      // Step 2: Send calculated hash to backend for SECURE VERIFICATION
      setMessage('🔐 Verifying with stored database hash (secure, backend-side verification)...');
      const verificationResponse = await fetch(`${API_BASE}/verify-file-hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId.trim(),
          calculatedHash: calculatedFileHash,
          ownerAddress: ownerAddress.trim()
        })
      });

      const verificationData = await verificationResponse.json();

      // Step 3: Display result
      setVerifyStep(3);
      
      if (!verificationResponse.ok) {
        throw new Error(verificationData.message || verificationData.error || 'Verification failed');
      }

      setVerificationResult({
        isIntact: verificationData.valid,
        message: verificationData.message
      });

      if (verificationData.valid) {
        setMessage('✅ File is AUTHENTIC! Hash matches the stored record.', 'success');
        setMessageType('success');
      } else {
        setMessage('❌ File is INVALID! Hash does NOT match the stored record. Either:\n• You selected the wrong file\n• The file was tampered with\n• The File ID or Owner Address is incorrect', 'error');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(`❌ Verification error: ${err.message}`);
      setMessageType('error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Download encrypted file without decryption (for verification)
  const downloadEncryptedFile = async () => {
    // Validate all required fields before downloading
    if (!encryptionKey?.trim()) {
      setMessage('❌ Please provide the encryption key', 'error');
      return;
    }

    if (!ownerAddress?.trim()) {
      setMessage('❌ Please provide the owner address', 'error');
      return;
    }

    if (!ownerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setMessage('❌ Invalid owner address format. Must be a valid Ethereum address (0x...)', 'error');
      return;
    }

    if (!fileId?.trim()) {
      setMessage('❌ Please provide the file ID', 'error');
      return;
    }

    setLoading(true);
    setMessage('� Validating credentials...');

    try {
      // Step 1: Validate credentials with server
      const validationResponse = await fetch(`${API_BASE}/validate-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId.trim(),
          ownerAddress: ownerAddress.trim()
        })
      });

      const validationData = await validationResponse.json();

      if (!validationResponse.ok) {
        throw new Error(validationData.error || 'Credential validation failed');
      }

      if (!validationData.valid) {
        throw new Error('Invalid credentials');
      }

      // Step 2: Validate encryption key
      setMessage('🔐 Validating encryption key...');
      const keyValidationResponse = await fetch(`${API_BASE}/validate-encryption-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId.trim(),
          encryptionKey: encryptionKey.trim()
        })
      });

      const keyValidationData = await keyValidationResponse.json();

      if (!keyValidationResponse.ok) {
        throw new Error(keyValidationData.error || 'Encryption key validation failed');
      }

      // Step 3: Download the file
      setMessage('📥 Downloading encrypted file...');
      
      console.log('DEBUG: Download request', { fileId, userAddress });
      
      if (!userAddress) {
        throw new Error('User wallet not connected. Please connect your wallet first.');
      }
      
      const downloadUrl = `${API_BASE}/file/${fileId}?userAddress=${encodeURIComponent(userAddress)}`;
      console.log('DEBUG: Download URL:', downloadUrl);
      
      const response = await fetch(downloadUrl);
      
      console.log('DEBUG: Download response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('DEBUG: Download error:', errorData);
        throw new Error(errorData.message || errorData.error || `Failed to download file: ${response.statusText}`);
      }

      const encryptedBlob = await response.blob();
      console.log('Encrypted file size:', encryptedBlob.size);
      
      // Get original filename if available
      let filename = `${fileId}-encrypted`;
      try {
        const filenameHeader = response.headers.get('X-Original-Filename');
        if (filenameHeader) {
          filename = `${decodeURIComponent(filenameHeader)}.encrypted`;
        }
      } catch (err) {
        console.warn('Could not read filename header:', err);
      }

      // Download encrypted file
      const url = URL.createObjectURL(encryptedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage(`✅ Encrypted file downloaded as: ${filename}\n\n📌 Next: Select the downloaded encrypted file below to verify its hash!`, 'success');
      setFileDownloaded(true);
    } catch (err) {
      console.error('Download error:', err);
      setMessage(`❌ Download failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Decrypt the verified file
  const decryptVerifiedFile = async () => {
    if (!fileId?.trim()) {
      setMessage('❌ Please provide the File ID to download the encrypted file from server');
      return;
    }

    if (!encryptionKey?.trim()) {
      setMessage('❌ Please provide the encryption key');
      return;
    }

    setIsDecrypting(true);
    setMessage('📥 Downloading encrypted file from server...');

    try {
      // Step 1: Download encrypted file from server using File ID
      console.log('Fetching verified file with ID:', fileId);
      
      if (!userAddress) {
        throw new Error('User wallet not connected. Please connect your wallet first.');
      }
      
      const downloadUrl = `${API_BASE}/file/${fileId}?userAddress=${encodeURIComponent(userAddress)}`;
      console.log('DEBUG: Decrypt download URL:', downloadUrl);
      
      const response = await fetch(downloadUrl);
      
      console.log('DEBUG: Decrypt download response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('DEBUG: Decrypt download error:', errorData);
        throw new Error(errorData.message || errorData.error || `Failed to download encrypted file: ${response.statusText}`);
      }

      // Extract original filename and mimeType from response headers
      // Try to get the headers - they may be exposed by CORS
      let originalFilename = `file-${fileId}`;
      let mimeType = 'application/octet-stream';
      
      try {
        const filenameHeader = response.headers.get('X-Original-Filename');
        const mimeHeader = response.headers.get('X-Mime-Type');
        
        console.log('Response headers available:');
        console.log('  X-Original-Filename:', filenameHeader);
        console.log('  X-Mime-Type:', mimeHeader);
        
        if (filenameHeader) {
          originalFilename = decodeURIComponent(filenameHeader);
        }
        if (mimeHeader) {
          mimeType = mimeHeader;
        }
      } catch (headerErr) {
        console.warn('Could not read custom headers:', headerErr);
      }
      
      console.log('Using metadata:', { originalFilename, mimeType });

      const encryptedBlob = await response.blob();
      const encryptedText = await encryptedBlob.text();
      
      setMessage('🔓 Decrypting file...');

      // Step 2: Decrypt using CryptoJS
      const decrypted = CryptoJS.AES.decrypt(
        encryptedText,
        encryptionKey.trim(),
        { format: CryptoJS.format.OpenSSL }
      );

      // Check if decryption succeeded
      if (!decrypted || decrypted.sigBytes === 0) {
        throw new Error('❌ DECRYPTION FAILED\n\nThe encryption key appears to be incorrect for this file.\n\n✓ Please verify:\n• File ID is correct\n• Encryption Key matches the original\n• Owner Address is correct');
      }

      console.log('Decryption successful, sigBytes:', decrypted.sigBytes);

      // Convert decrypted data to bytes for proper binary output (using unsigned right shift)
      const wordArrayToUint8Array = (wordArray) => {
        const words = wordArray.words;
        const sigBytes = wordArray.sigBytes;
        const u8 = new Uint8Array(sigBytes);
        let index = 0;

        for (let i = 0; i < words.length && index < sigBytes; i++) {
          const word = words[i];
          u8[index++] = (word >>> 24) & 0xff;
          if (index >= sigBytes) break;
          u8[index++] = (word >>> 16) & 0xff;
          if (index >= sigBytes) break;
          u8[index++] = (word >>> 8) & 0xff;
          if (index >= sigBytes) break;
          u8[index++] = word & 0xff;
        }

        return u8;
      };

      const decryptedBytes = wordArrayToUint8Array(decrypted);

      if (!decryptedBytes || decryptedBytes.length === 0) {
        throw new Error('❌ DECRYPTION FAILED\n\nThe decrypted data is empty or the encryption key may be incorrect.\n\nTip: Ensure you are using the exact encryption key from the upload.');
      }

      console.log('Decrypted bytes length:', decryptedBytes.length);

      // Step 3: Download the decrypted file in its original format
      const decryptedBlob = new Blob([decryptedBytes], { type: mimeType });
      const url = URL.createObjectURL(decryptedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('File downloaded:', originalFilename);

      setFileDownloaded(true);
      setMessage(`✅ File decrypted and downloaded as: ${originalFilename}`, 'success');
    } catch (err) {
      console.error('Decryption error:', err);
      setMessage(`❌ Decryption failed: ${err.message}`, 'error');
    } finally {
      setIsDecrypting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Download encrypted file from server
  // Note: Replaced by 3-step workflow (downloadEncryptedFile → verifyFile → decryptVerifiedFile)

  return (
    <div className="file-verify-container">
      <div className="verify-card">
        <h3>🔍 Verify File Integrity</h3>

        {/* File Upload Section */}
        <div className="verify-section">
          <h4>📤 Select File</h4>
          <div 
            className={`file-input-wrapper ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="verifyFileInput"
              onChange={handleFileSelect}
              disabled={loading}
              className="file-input"
            />
            <label htmlFor="verifyFileInput" className="file-label">
              {fileName ? (
                <>
                  <span className="file-icon">📄</span>
                  <span className="file-name">{fileName}</span>
                </>
              ) : (
                <>
                  <span className="drag-icon">📁</span>
                  <span>Drag & drop your downloaded file here, or click to select</span>
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
            </div>
          )}
        </div>

        {/* Hash Inputs Section */}
        <div className="verify-section">
          <h4>🔑 Enter Verification Details</h4>

          {/* Shared Keys Section */}
          <div className="shared-keys-section">
            <button 
              onClick={retrieveSharedKeys} 
              disabled={!userAddress || loading}
              className="btn btn-secondary"
            >
              {loading ? '⏳ Loading...' : '📥 Get My Shared Keys'}
            </button>

            {showSharedKeys && sharedKeys.length > 0 && (
              <div className="shared-keys-list">
                <h5>🔐 Keys Shared With You:</h5>
                {sharedKeys.map((key, idx) => (
                  <div key={idx} className="shared-key-item">
                    <div className="key-details">
                      <div className="key-info">
                        <strong>📄 Filename:</strong> {key.originalFilename || `file-${key.fileId}`}
                      </div>
                      <div className="key-info">
                        <strong>File ID:</strong> {key.fileId}
                      </div>
                      <div className="key-info">
                        <strong>Owner:</strong> {key.ownerAddress.slice(0, 6)}...{key.ownerAddress.slice(-4)}
                      </div>
                      <div className="key-info small">
                        <strong>Shared:</strong> {new Date(key.sharedAt).toLocaleDateString()} | 
                        <strong> Expires:</strong> {new Date(key.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => applySharedKey(key)}
                      className="btn btn-sm btn-success"
                    >
                      Use This Key
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="encryptionKey">
              <span className="required">*</span> Encryption Key
              <small>(from upload details or shared with you)</small>
            </label>
            <div className="input-group-with-copy">
              <input
                type="text"
                id="encryptionKey"
                placeholder="Paste encryption key here..."
                className="input-field"
                value={encryptionKey}
                onChange={(e) => {
                  setEncryptionKey(e.target.value);
                  setFileDownloaded(false);
                }}
                disabled={loading}
              />
              {encryptionKey && (
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(encryptionKey)}
                  title="Copy key"
                >
                  📋
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ownerAddress">
              <span className="required">*</span> Owner Address
              <small>(wallet that uploaded the file)</small>
            </label>
            <div className="input-group-with-copy">
              <input
                type="text"
                id="ownerAddress"
                placeholder="0x123abc..."
                className="input-field"
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                disabled={loading}
              />
              {ownerAddress && (
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(ownerAddress)}
                  title="Copy address"
                >
                  📋
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fileId">
              <span className="required">*</span> File ID
              <small>(from your upload metadata)</small>
            </label>
            <div className="input-group-with-copy">
              <input
                type="text"
                id="fileId"
                placeholder="1773083062552-uu5had"
                className="input-field"
                value={fileId}
                onChange={(e) => {
                  setFileId(e.target.value);
                  setFileDownloaded(false);
                }}
                disabled={loading}
              />
              {fileId && (
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(fileId)}
                  title="Copy ID"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {loading && verifyStep > 0 && (
          <div className="verify-progress">
            <div className="steps-indicator">
              <div className={`step ${verifyStep >= 1 ? 'active' : ''}`}>
                <span>{verifyStep > 1 ? '✓' : verifyStep === 1 ? '⏳' : '○'}</span>
                <span>Hash</span>
              </div>
              <div className={`step ${verifyStep >= 2 ? 'active' : ''}`}>
                <span>{verifyStep > 2 ? '✓' : verifyStep === 2 ? '⏳' : '○'}</span>
                <span>Compare</span>
              </div>
              <div className={`step ${verifyStep >= 3 ? 'active' : ''}`}>
                <span>{verifyStep > 3 ? '✓' : verifyStep === 3 ? '⏳' : '○'}</span>
                <span>Result</span>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className="verify-section result-section">
            <h4>📋 Verification Result</h4>
            
            <div className={`result-status ${verificationResult.isIntact ? 'authentic' : 'tampered'}`}>
              <span className="status-icon">
                {verificationResult.isIntact ? '✅' : '❌'}
              </span>
              <span className="status-text">
                {verificationResult.isIntact ? 'AUTHENTIC' : 'INVALID'}
              </span>
            </div>

            <div className="hash-comparison">
              <div className="result-message">
                {verificationResult.message}
              </div>
            </div>
          </div>
        )}

        {/* Decrypt Verified File Section */}
        {verificationResult && verificationResult.isIntact && (
          <div className="verify-section decrypt-section">
            <h4>🔓 Decrypt Verified File</h4>
            <p className="section-description">
              Your file has been verified as authentic ✅. Now download the encrypted file from the server and decrypt it to view the original content.
            </p>
            <button
              className="decrypt-button"
              onClick={decryptVerifiedFile}
              disabled={isDecrypting || !encryptionKey?.trim() || !fileId?.trim()}
            >
              {isDecrypting ? (
                <>
                  <span>⏳</span>
                  Decrypting...
                </>
              ) : (
                <>🔓 Decrypt File</>
              )}
            </button>
          </div>
        )}

        {/* Decryption Troubleshooting */}
        {!fileDownloaded && verificationResult && verificationResult.isIntact && (
          <div className="troubleshooting-section">
            <h4>🔧 Decryption Troubleshooting:</h4>
            <div className="checklist">
              <div className={`checklist-item ${fileId?.trim() ? 'valid' : 'invalid'}`}>
                <span className="checkbox">{fileId?.trim() ? '✓' : '○'}</span>
                <span>File ID is provided (to download encrypted file from server)</span>
              </div>
              <div className={`checklist-item ${encryptionKey?.trim() ? 'valid' : 'invalid'}`}>
                <span className="checkbox">{encryptionKey?.trim() ? '✓' : '○'}</span>
                <span>Encryption key is entered exactly as stored (watch for extra spaces)</span>
              </div>
              <div className={`checklist-item ${verificationResult?.isIntact ? 'valid' : 'invalid'}`}>
                <span className="checkbox">{verificationResult?.isIntact ? '✓' : '○'}</span>
                <span>File hash is verified and matches blockchain record</span>
              </div>
              <div className="checklist-hint">
                <strong>💡 If decryption still fails:</strong><br/>
                1. Copy encryption key from FileUpload → Upload Details (exact copy, no spaces)<br/>
                2. Verify File ID is correct (same file you uploaded)<br/>
                3. Check that encryption key wasn't truncated or modified<br/>
                4. Try the "Get My Shared Keys" button to auto-fill credentials from a shared key
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Action Buttons - 3 Stage Workflow */}
        <div className="action-buttons-section">
          {/* Step 1: Download Encrypted File - ONLY when not downloaded AND no file selected */}
          {!fileDownloaded && !file && (
            <button
              className="download-button"
              onClick={downloadEncryptedFile}
              disabled={loading || !fileId.trim()}
              title="Download encrypted file from server for verification"
            >
              {loading ? (
                <>
                  <span>⏳</span>
                  Downloading...
                </>
              ) : (
                <>Download Encrypted File</>
              )}
            </button>
          )}

          {/* Step 2: Verify File Hash - shows once a file is selected */}
          {file && !verificationResult && (
            <>
              {fileDownloaded && (
                <p className="step-instruction">
                  ✅ File downloaded! Now select the downloaded encrypted file above to verify its hash.
                </p>
              )}
              <button
                className="verify-button"
                onClick={verifyFile}
                disabled={loading || !file || !ownerAddress?.trim() || !fileId?.trim()}
                title="Verify file hasn't been tampered with"
              >
                {loading ? (
                  <>
                    <span>⏳</span>
                    {verifyStep === 1 && 'Calculating Hash...'}
                    {verifyStep === 2 && 'Comparing...'}
                    {verifyStep === 3 && 'Verifying...'}
                  </>
                ) : (
                  <>Verify File Hash</>
                )}
              </button>
            </>
          )}

          {/* Step 3: Decrypt Verified File - ONLY after successful verification */}
          {verificationResult && verificationResult.isIntact && (
            <>
              <div className="verification-success">
                <p>✅ Hash verification PASSED! File is authentic.</p>
                <p>You can now safely decrypt the file to its original format.</p>
              </div>
              <button
                className="decrypt-button"
                onClick={decryptVerifiedFile}
                disabled={loading || isDecrypting || !fileId.trim() || !encryptionKey.trim()}
                title="Decrypt verified file to original format"
              >
                {isDecrypting ? (
                  <>
                    <span>⏳</span>
                    Decrypting...
                  </>
                ) : (
                  <>🔓 Decrypt Verified File</>
                )}
              </button>
            </>
          )}

          {/* Warning for tampered files */}
          {verificationResult && !verificationResult.isIntact && (
            <div className="tampered-warning">
              <p>⚠️ File verification FAILED! Hash mismatch detected.</p>
              <p>❌ DO NOT decrypt this file - it may have been tampered with.</p>
              <button
                className="reset-button"
                onClick={() => {
                  setFileDownloaded(false);
                  setVerificationResult(null);
                  setFile(null);
                  setFileName('');
                  setCalculatedFileHash('');
                  setMessage('');
                  setVerifyStep(0);
                }}
              >
                ↻ Start Over
              </button>
            </div>
          )}
        </div>

        <div className="troubleshooting-section">
          <h4>🔧 Decryption Troubleshooting:</h4>
          <div className="checklist">
            <div className={`checklist-item ${fileId?.trim() ? 'valid' : 'invalid'}`}>
              <span className="checkbox">{fileId?.trim() ? '✓' : '○'}</span>
              <span>File ID matches original upload</span>
            </div>
            <div className={`checklist-item ${encryptionKey?.trim() ? 'valid' : 'invalid'}`}>
              <span className="checkbox">{encryptionKey?.trim() ? '✓' : '○'}</span>
              <span>Encryption key is exactly as stored (no extra spaces)</span>
            </div>
            <div className={`checklist-item ${ownerAddress?.trim() ? 'valid' : 'invalid'}`}>
              <span className="checkbox">{ownerAddress?.trim() ? '✓' : '○'}</span>
              <span>Owner address is correct (wallet that uploaded)</span>
            </div>
            <div className="checklist-hint">
              <strong>💡 Tip:</strong> If "Decryption failed" appears, use the "Get My Shared Keys" button to auto-fill the correct credentials from a user who shared the file with you.
            </div>
          </div>
        </div>

        <div className="verify-info">
          <h4>🛡️ How It Works:</h4>
          <ul>
            <li><span className="step-dot">1</span> <strong>Upload File:</strong> Select the file you want to verify</li>
            <li><span className="step-dot">2</span> <strong>Enter Details:</strong> Provide hash, owner address, and file ID</li>
            <li><span className="step-dot">3</span> <strong>Calculate Hash:</strong> SHA-256 fingerprint of your file</li>
            <li><span className="step-dot">4</span> <strong>Compare:</strong> Check if it matches blockchain record</li>
            <li><span className="step-dot">5</span> <strong>Decrypt:</strong> Try to decrypt using wallet key</li>
          </ul>
        </div>

        <div className="important-note">
          <h4>ℹ️ Important Notes:</h4>
          <ul>
            <li>✓ Hash verification proves file hasn't been tampered</li>
            <li>✓ Decryption requires the original owner's wallet address</li>
            <li>✓ You can only decrypt if you have access rights</li>
            <li>✓ Keep your blockchain hash and file ID safe</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileVerify;
