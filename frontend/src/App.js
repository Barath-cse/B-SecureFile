import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import FileUpload from './components/FileUpload';
import FileVerify from './components/FileVerify';
import AccessControl from './components/AccessControl';
import './App.css';

// If you don't want to interact with the blockchain (no gas required)
// set this flag to false. The app will behave like the older version.
const BLOCKCHAIN_ENABLED = true;

// Contract configuration – only used when BLOCKCHAIN_ENABLED is true
const contractAddress = "0x48b036c301671425943013473794ab722243ff7c";

const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "string", "name": "_fileHash", "type": "string"}],
        "name": "uploadFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_fileHash", "type": "string"}],
        "name": "verifyFile",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_fileHash", "type": "string"},
            {"internalType": "address", "name": "_userAddress", "type": "address"}
        ],
        "name": "grantAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_fileHash", "type": "string"},
            {"internalType": "address", "name": "_userAddress", "type": "address"}
        ],
        "name": "revokeAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_fileHash", "type": "string"}],
        "name": "getAccessList",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_fileHash", "type": "string"}],
        "name": "getAccessCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  // when blockchain is disabled we don't care about wallet or address
  const [userAddress, setUserAddress] = useState(BLOCKCHAIN_ENABLED ? '' : 'offline');
  const [connected, setConnected] = useState(BLOCKCHAIN_ENABLED ? false : true);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

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
    } catch (err) {
      console.error('Error setting up contract:', err);
      alert('Failed to initialize contract. Please check your connection.');
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setUserAddress('');
    setProvider(null);
    setContract(null);
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
                <p>Connected Wallet: <span className="wallet-address">{userAddress}</span></p>
                <button className="disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
              </div>
            )}

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
              {BLOCKCHAIN_ENABLED && (
                <button
                  className={`tab-button ${activeTab === 'access' ? 'active' : ''}`}
                  onClick={() => setActiveTab('access')}
                >
                  🔐 Access Control
                </button>
              )}
            </div>

            <div className="tab-content">
              {activeTab === 'upload' && <FileUpload userAddress={userAddress} provider={provider} contract={contract} />}
              {activeTab === 'verify' && <FileVerify userAddress={userAddress} />}
              {activeTab === 'access' && BLOCKCHAIN_ENABLED && (
                <AccessControl 
                  userAddress={userAddress}
                  provider={provider}
                  contract={contract}
                  abi={CONTRACT_ABI}
                />
              )}
            </div>
          </div>
        )}      </main>

      <footer className="app-footer">
        <p>© 2024 BlockSecure. Decentralized File Integrity System.</p>
      </footer>
    </div>
  );
}

export default App;
