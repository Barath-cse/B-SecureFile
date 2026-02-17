import React, { useState } from 'react';
import { calculateHash, decryptFile } from '../utils/crypto';
import '../styles/FileVerify.css';

function FileVerify({ userAddress }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [blockchainHash, setBlockchainHash] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
      setVerificationResult(null);
    }
  };

  const verifyFile = async () => {
    if (!file) {
      setMessage('Please select a file to verify');
      setMessageType('error');
      return;
    }

    if (!blockchainHash) {
      setMessage('Please provide the original file hash from blockchain');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('Verifying file integrity...');
    setMessageType('');

    try {
      // Step 1: Calculate hash of the downloaded file
      const downloadedHash = await calculateHash(file);
      console.log('Downloaded Hash:', downloadedHash);
      console.log('Blockchain Hash:', blockchainHash);

      // Step 2: Compare hashes
      const isIntact = downloadedHash.toLowerCase() === blockchainHash.toLowerCase();

      // Step 3: Try to decrypt if encryption key provided
      let decryptedFile = null;
      if (encryptionKey && isIntact) {
        try {
          setMessage('Decrypting file...');
          decryptedFile = await decryptFile(file, encryptionKey);
          console.log('File decrypted successfully');
        } catch (decryptErr) {
          console.warn('Decryption error:', decryptErr);
        }
      }

      // Step 4: Display result
      setVerificationResult({
        isIntact,
        downloadedHash,
        blockchainHash,
        decryptionSuccess: !!decryptedFile
      });

      if (isIntact) {
        setMessage('✅ File is AUTHENTIC! File hash matches blockchain record.');
        setMessageType('success');
      } else {
        setMessage('⚠️ File is TAMPERED! Hash mismatch detected.');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setMessageType('error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-verify-container">
      <div className="verify-card">
        <h3>Verify File Integrity</h3>

        <div className="form-group">
          <label>Upload File to Verify:</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="verifyFileInput"
              onChange={handleFileSelect}
              disabled={loading}
              className="file-input"
            />
            <label htmlFor="verifyFileInput" className="file-label">
              {fileName || '📁 Select file to verify'}
            </label>
          </div>
        </div>

        {file && (
          <div className="file-info">
            <p><strong>File:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="blockchainHash">Blockchain Hash (from original upload):</label>
          <input
            type="text"
            id="blockchainHash"
            value={blockchainHash}
            onChange={(e) => setBlockchainHash(e.target.value)}
            placeholder="0x..."
            disabled={loading}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="encryptionKey">Encryption Key (optional for decryption):</label>
          <input
            type="text"
            id="encryptionKey"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
            placeholder="Enter encryption key if you need to decrypt"
            disabled={loading}
            className="input-field"
          />
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {verificationResult && (
          <div className="verification-result">
            <div className={`result-status ${verificationResult.isIntact ? 'authentic' : 'tampered'}`}>
              {verificationResult.isIntact ? '✅ AUTHENTIC' : '⚠️ TAMPERED'}
            </div>
            <div className="hash-comparison">
              <div className="hash-item">
                <strong>Downloaded Hash:</strong>
                <code>{verificationResult.downloadedHash}</code>
              </div>
              <div className="hash-item">
                <strong>Blockchain Hash:</strong>
                <code>{verificationResult.blockchainHash}</code>
              </div>
              <div className={`match-indicator ${verificationResult.isIntact ? 'match' : 'no-match'}`}>
                {verificationResult.isIntact ? '✓ MATCH' : '✗ MISMATCH'}
              </div>
            </div>
            {verificationResult.decryptionSuccess && (
              <div className="success-info">
                📂 File successfully decrypted!
              </div>
            )}
          </div>
        )}

        <button
          className="verify-button"
          onClick={verifyFile}
          disabled={loading || !file || !blockchainHash}
        >
          {loading ? 'Verifying...' : '🔍 Verify Integrity'}
        </button>

        <div className="verify-info">
          <h4>How verification works:</h4>
          <ul>
            <li>📊 Calculate SHA-256 hash of downloaded file</li>
            <li>⛓️ Compare with hash stored on blockchain</li>
            <li>🆚 If hashes match → File is authentic</li>
            <li>🔓 If hashes differ → File has been tampered</li>
            <li>🔐 Optionally decrypt file with encryption key</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileVerify;
