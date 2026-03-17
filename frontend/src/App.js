import React, { useState, Suspense } from 'react';
import WalletConnect from './components/WalletConnect';
import './App.css';

const FileUpload = React.lazy(() => import('./components/FileUpload'));
const FileVerify = React.lazy(() => import('./components/FileVerify'));
const AccessControl = React.lazy(() => import('./components/AccessControl'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
    <p>⏳ Loading...</p>
  </div>
);

// If you don't want to interact with the blockchain (no gas required)
// set this flag to false. The app will behave like the older version.
const BLOCKCHAIN_ENABLED = true;

// Contract configuration – only used when BLOCKCHAIN_ENABLED is true
const contractAddress = "0xBCBf15C2899D62d6701A8294d88751E98512dec0";

const CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "fileId", "type": "string"},
            {"internalType": "string", "name": "_hash", "type": "string"}
        ],
        "name": "uploadFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "fileId", "type": "string"},
            {"internalType": "string", "name": "_hash", "type": "string"}
        ],
        "name": "verifyFile",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "fileId", "type": "string"},
            {"internalType": "address", "name": "user", "type": "address"}
        ],
        "name": "grantAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "fileId", "type": "string"},
            {"internalType": "address", "name": "user", "type": "address"}
        ],
        "name": "revokeAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "fileId", "type": "string"},
            {"internalType": "address", "name": "user", "type": "address"}
        ],
        "name": "hasAccess",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "fileId", "type": "string"}
        ],
        "name": "getFileDetails",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },

];

function App() {
  // Restore tab from session storage if available (to avoid redirect on page refresh)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const lastTab = sessionStorage.getItem('lastTab');
      if (lastTab) return lastTab;
    } catch {}
    return 'upload';
  });

  // when blockchain is disabled we don't care about wallet or address
  // initialize from storage if available; fallback to offline/empty
  const [userAddress, setUserAddress] = useState(() => {
    try {
      const stored = localStorage.getItem('userAddress');
      if (stored) return stored;
    } catch {}
    return BLOCKCHAIN_ENABLED ? '' : 'offline';
  });
  
  // Restore connection status from localStorage (persist across page refresh)
  const [connected, setConnected] = useState(() => {
    if (!BLOCKCHAIN_ENABLED) return true;
    try {
      const wasConnected = localStorage.getItem('walletConnected');
      return wasConnected === 'true';
    } catch {}
    return false;
  });
  
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // used to signal other components (e.g. AccessControl) that files may need reloading
  const [filesRefreshToken, setFilesRefreshToken] = useState(0);
  const triggerFilesRefresh = () => setFilesRefreshToken((t) => t + 1);

  const handleWalletConnect = async (address) => {
    // only used when blockchain enabled
    try {
      const ethers = await import('ethers');
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethersProvider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      setProvider(ethersProvider);
      setContract(contractInstance);
      setUserAddress(address);
      setConnected(true);

      try {
        localStorage.setItem('userAddress', address);
        localStorage.setItem('walletConnected', 'true');
      } catch {}
    } catch (err) {
      console.error('Error setting up contract:', err);
      alert('Failed to initialize contract. Please check your connection.');
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    // keep userAddress so that users can still manage files offline and view their address
    // but clear blockchain-connected state
    setProvider(null);
    setContract(null);
    
    try {
      localStorage.setItem('walletConnected', 'false');
    } catch {}
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🔐 BlockSecure</h1>
        <p>Blockchain-Based Secure File Integrity & Access Control</p>
      </header>

      <main className="app-main">
        {BLOCKCHAIN_ENABLED && !connected ? (
          <WalletConnect onConnect={handleWalletConnect} />
        ) : (
          <div className="authenticated-area">
            {BLOCKCHAIN_ENABLED && (
              <div className="user-info">
                <p>
                  {connected ? 'Connected Wallet:' : 'Using Wallet:'}{' '}
                  <span className="wallet-address">{userAddress || 'N/A'}</span>
                </p>
                {connected && (
                  <button className="disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
                )}
              </div>
            )}

            <div className="tabs">
              <button
                className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('upload');
                  sessionStorage.setItem('lastTab', 'upload');
                }}
              >
                📤 Upload File
              </button>
              <button
                className={`tab-button ${activeTab === 'verify' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('verify');
                  sessionStorage.setItem('lastTab', 'verify');
                }}
              >
                ✅ Verify File
              </button>
              <button
                className={`tab-button ${activeTab === 'access' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('access');
                  sessionStorage.setItem('lastTab', 'access');
                }}
              >
                🔐 Access Control
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'upload' && (
                <Suspense fallback={<LoadingFallback />}>
                  <FileUpload userAddress={userAddress} provider={provider} contract={contract} onUploadSuccess={triggerFilesRefresh} />
                </Suspense>
              )}
              {activeTab === 'verify' && (
                <Suspense fallback={<LoadingFallback />}>
                  <FileVerify userAddress={userAddress} contract={contract} />
                </Suspense>
              )}
              {activeTab === 'access' && (
                <Suspense fallback={<LoadingFallback />}>
                  <AccessControl 
                    userAddress={userAddress}
                    provider={provider}
                    contract={contract}
                    abi={CONTRACT_ABI}
                    refreshToken={filesRefreshToken}
                  />
                </Suspense>
              )}
            </div>
          </div>
        )}      </main>

      <footer className="app-footer">
        <p>© BlockSecure. Decentralized File Integrity System.</p>
      </footer>
    </div>
  );
}

export default App;
