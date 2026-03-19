import React from 'react';
import '../styles/GettingStarted.css';

function GettingStarted() {
  return (
    <div className="getting-started-container">
      <div className="getting-started-card">
        <h3>🚀 Welcome to BlockSecure!</h3>
        <p className="intro-text">
          Secure file sharing with blockchain verification. Follow these simple steps to get started.
        </p>

        <div className="quick-start-section">
          <h4>⚡ Quick Start (3 minutes)</h4>
          <div className="steps-grid">
            {/* <div className="step-card">
              <div className="step-number">1</div>
              <h5>Connect Your Wallet</h5>
              <p>Install MetaMask and connect your Ethereum wallet to authenticate securely.</p>
              <div className="step-details">
                <ul>
                  <li>Install MetaMask browser extension</li>
                  <li>Click "Connect Wallet" above</li>
                  <li>Approve the connection</li>
                </ul>
              </div>
            </div> */}

            <div className="step-card">
              <div className="step-number">1</div>
              <h5>Upload a File</h5>
              <p>Upload any file - it gets encrypted with AES-256 and stored securely.</p>
              <div className="step-details">
                <ul>
                  <li>Go to "Upload File" tab</li>
                  <li>Drag & drop or select a file</li>
                  <li>Click "Upload & Encrypt"</li>
                  <li><strong>Save the File ID and Encryption Key!</strong></li>
                </ul>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h5>Verify & Download</h5>
              <p>Verify file integrity and decrypt to access the original content.</p>
              <div className="step-details">
                <ul>
                  <li>Go to "Verify File" tab</li>
                  <li>Enter File ID, Owner Address, and Encryption Key</li>
                  <li>Download and verify the encrypted file</li>
                  <li>Decrypt to get your original file</li>
                </ul>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h5>Share with Others </h5>
              <p>Grant access to specific users so they can download your files.</p>
              <div className="step-details">
                <ul>
                  <li>Go to "Access Control" tab</li>
                  <li>Enter recipient's wallet address</li>
                  <li>Share File ID and Encryption Key</li>
                  <li>They can now verify and decrypt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h4>✨ Key Features</h4>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <div>
                <strong>End-to-End Encryption</strong>
                <p>Files encrypted with AES-256 before leaving your browser</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <div>
                <strong>Tamper Detection</strong>
                <p>SHA-256 hashing ensures files can't be modified undetected</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⛓️</span>
              <div>
                <strong>Blockchain Verification</strong>
                <p>File hashes stored on Ethereum for immutable records</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔑</span>
              <div>
                <strong>Wallet Authentication</strong>
                <p>No passwords - just connect your MetaMask wallet</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <div>
                <strong>Controlled Sharing</strong>
                <p>Grant and revoke access to specific users</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <div>
                <strong>Decentralized Security</strong>
                <p>You control your private keys, not us</p>
              </div>
            </div>
          </div>
        </div>

        <div className="workflow-section">
          <h4>🔄 How It Works</h4>
          <div className="workflow-diagram">
            <div className="workflow-step">
              <div className="workflow-icon">📤</div>
              <div className="workflow-text">
                <strong>Upload</strong><br/>
                File → Encrypt → Hash → Store
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="workflow-icon">⛓️</div>
              <div className="workflow-text">
                <strong>Blockchain</strong><br/>
                Hash registered on Ethereum
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="workflow-icon">✅</div>
              <div className="workflow-text">
                <strong>Verify</strong><br/>
                Compare hashes for integrity
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="workflow-icon">🔓</div>
              <div className="workflow-text">
                <strong>Decrypt</strong><br/>
                Access original file content
              </div>
            </div>
          </div>
        </div>

        <div className="tips-section">
          <h4>💡 Important Tips</h4>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">📋</span>
              <div>
                <strong>Save Your Keys</strong>
                <p>Always save the File ID and Encryption Key after upload. You can't recover them!</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔒</span>
              <div>
                <strong>Keep Keys Secure</strong>
                <p>Share keys only with trusted recipients. Anyone with both keys can access your files.</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⚡</span>
              <div>
                <strong>MetaMask Required</strong>
                <p>You need MetaMask installed and some ETH for blockchain transactions.</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⏰</span>
              <div>
                <strong>Shared Keys Expire</strong>
                <p>When sharing files, set expiration dates for access keys. Recipients must use keys before they expire.</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📱</span>
              <div>
                <strong>Test First</strong>
                <p>Upload a small test file first to understand the process before important files.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <p>Ready to get started? Connect your wallet above and try uploading a file!</p>
          <div className="cta-buttons">
            <button
              className="cta-button primary"
              onClick={() => {
                document.querySelector('[data-tab="upload"]').click();
              }}
            >
              📤 Start Uploading
            </button>
            <button
              className="cta-button secondary"
              onClick={() => {
                document.querySelector('[data-tab="verify"]').click();
              }}
            >
              ✅ Try Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GettingStarted;