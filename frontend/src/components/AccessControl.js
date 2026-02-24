import React, { useState } from 'react';
import '../styles/AccessControl.css';

function AccessControl({ userAddress, provider, contract, abi }) {
  const [fileHash, setFileHash] = useState('');
  const [grantAddress, setGrantAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessList, setAccessList] = useState([]);

  const handleGrantAccess = async () => {
    if (!fileHash) {
      return;
    }
    if (!grantAddress) {
      return;
    }
    if (!grantAddress.startsWith('0x')) {
      return;
    }

    setLoading(true);

    try {
      if (!contract) throw new Error('Contract not connected');

      const tx = await contract.grantAccess(fileHash, grantAddress);
      await provider.waitForTransaction(tx.hash);
      setGrantAddress('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!fileHash) {
      return;
    }
    if (!grantAddress) {
      return;
    }

    setLoading(true);

    try {
      if (!contract) throw new Error('Contract not connected');

      const tx = await contract.revokeAccess(fileHash, grantAddress);
      await provider.waitForTransaction(tx.hash);
      setGrantAddress('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleListAccess = async () => {
    if (!fileHash) {
      return;
    }

    setLoading(true);

    try {
      if (!contract) throw new Error('Contract not connected');

      const list = await contract.getAccessList(fileHash);
      setAccessList(list);
    } catch (err) {
      console.error(err);
      setAccessList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-control-container">
      <div className="access-card">
        <h3>🔐 Access Control (Phase 5)</h3>

        <div className="input-group">
          <input
            type="text"
            placeholder="File hash (SHA-256)"
            value={fileHash}
            onChange={(e) => setFileHash(e.target.value)}
            disabled={loading}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Address to grant/revoke access (0x...)"
            value={grantAddress}
            onChange={(e) => setGrantAddress(e.target.value)}
            disabled={loading}
            className="input-field"
          />
        </div>

        <div className="button-group">
          <button
            className="control-button grant"
            onClick={handleGrantAccess}
            disabled={loading || !fileHash || !grantAddress}
          >
            {loading ? 'Processing...' : '✔️ Grant Access'}
          </button>

          <button
            className="control-button revoke"
            onClick={handleRevokeAccess}
            disabled={loading || !fileHash || !grantAddress}
          >
            {loading ? 'Processing...' : '❌ Revoke Access'}
          </button>

          <button
            className="control-button list"
            onClick={handleListAccess}
            disabled={loading || !fileHash}
          >
            {loading ? 'Loading...' : '📋 List Access'}
          </button>
        </div>

        {accessList.length > 0 && (
          <div className="access-list">
            <h4>Addresses with access:</h4>
            <ul>
              {accessList.map((addr, idx) => (
                <li key={idx}>
                  <code>{addr}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessControl;
