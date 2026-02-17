import React, { useState } from 'react';
import '../styles/WalletConnect.css';

function WalletConnect({ onConnect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install it to continue.');
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        onConnect(accounts[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-connect-container">
      <div className="wallet-card">
        <div className="wallet-icon">🦊</div>
        <h2>Connect Your Wallet</h2>
        <p>To use BlockSecure, connect your MetaMask wallet.</p>

        {error && <div className="error-message">{error}</div>}

        <button
          className="connect-button"
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect MetaMask'}
        </button>

        <div className="wallet-info">
          <h3>Requirements:</h3>
          <ul>
            <li>MetaMask browser extension installed</li>
            <li>Connected to Ganache (localhost:7545) or Sepolia testnet</li>
            <li>Some test ETH for gas fees</li>
          </ul>
        </div>

        <div className="setup-steps">
          <h3>Setup Guide:</h3>
          <ol>
            <li>Install MetaMask: <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">metamask.io</a></li>
            <li>Create a wallet and note your seed phrase</li>
            <li>Switch network to Ganache/Sepolia in MetaMask</li>
            <li>Click "Connect MetaMask" button</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default WalletConnect;
