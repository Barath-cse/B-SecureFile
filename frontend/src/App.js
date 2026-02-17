import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import FileUpload from './components/FileUpload';
import FileVerify from './components/FileVerify';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleWalletConnect = (address) => {
    setUserAddress(address);
    setConnected(true);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setUserAddress('');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🔐 BlockSecure</h1>
        <p>Blockchain-Based Secure File Integrity & Access Control</p>
      </header>

      <main className="app-main">
        {!connected ? (
          <WalletConnect onConnect={handleWalletConnect} />
        ) : (
          <div className="authenticated-area">
            <div className="user-info">
              <p>Connected Wallet: <span className="wallet-address">{userAddress}</span></p>
              <button className="disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
            </div>

            <div className="tabs">
              <button
                className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                📤 Upload File
              </button>
              <button
                className={`tab-button ${activeTab === 'verify' ? 'active' : ''}`}
                onClick={() => setActiveTab('verify')}
              >
                ✅ Verify File
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'upload' && <FileUpload userAddress={userAddress} />}
              {activeTab === 'verify' && <FileVerify userAddress={userAddress} />}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 BlockSecure. Decentralized File Integrity System.</p>
      </footer>
    </div>
  );
}

export default App;
