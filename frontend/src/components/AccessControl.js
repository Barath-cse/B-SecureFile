import React, { useState, useCallback } from 'react';

// Prefer REACT_APP_API_URL (prod) then REACT_APP_API_BASE (dev), fallback to same-origin /api
const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || '/api';

const AccessControl = () => {
  const [fileId, setFileId] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [accessList, setAccessList] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Check file metadata
  const checkFile = useCallback(async () => {
    if (!fileId.trim()) {
      setMessage('Please enter a File ID');
      return;
    }
    try {
      setMessage('');
      const res = await fetch(`${API_BASE}/file-metadata/${fileId.trim()}`);

      if (!res.ok) {
        throw new Error('File not found');
      }

      const data = await res.json();
      setMetadata(data);
      setMessage('Metadata loaded');
    } catch (err) {
      console.error('Error in checkFile:', err);
      setMessage(err.message || 'Failed to load file');
    }
  }, [fileId]);

  // ✅ Refresh access list
  const refreshAccessList = useCallback(async () => {
    if (!fileId.trim() || !ownerAddress.trim()) {
      setMessage('File ID and Owner Address are required');
      return;
    }
    try {
      setLoading(true);
      setMessage('Loading access list...');
      const res = await fetch(`${API_BASE}/access-list/${fileId.trim()}/${ownerAddress.trim()}`);

      if (!res.ok) {
        throw new Error('Failed to fetch access list');
      }

      const data = await res.json();
      setAccessList(data.accessList || []);
      setMessage(`Access list loaded (${data.accessCount || 0})`);
    } catch (err) {
      console.error('Error fetching access list:', err);
      setMessage(err.message || 'Error fetching access list');
    } finally {
      setLoading(false);
    }
  }, [fileId, ownerAddress]);

  // ✅ Grant access
  const grantAccess = async (address) => {
    if (!fileId.trim() || !ownerAddress.trim() || !address.trim()) {
      setMessage('File ID, Owner Address, and User Address are required');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/grant-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: fileId.trim(), ownerAddress: ownerAddress.trim(), userAddress: address.trim() })
      });

      if (!res.ok) {
        throw new Error('Grant access failed');
      }

      await refreshAccessList();
      setMessage(`Access granted to ${address}`);
    } catch (err) {
      console.error('Error granting access:', err);
      setMessage(err.message || 'Grant access failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Revoke access
  const revokeAccess = async (address) => {
    if (!fileId.trim() || !ownerAddress.trim() || !address.trim()) {
      setMessage('File ID, Owner Address, and User Address are required');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/revoke-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: fileId.trim(), ownerAddress: ownerAddress.trim(), userAddress: address.trim() })
      });

      if (!res.ok) {
        throw new Error('Revoke access failed');
      }

      await refreshAccessList();
      setMessage(`Access revoked for ${address}`);
    } catch (err) {
      console.error('Error revoking access:', err);
      setMessage(err.message || 'Revoke access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Access Control</h2>

      <input
        type="text"
        placeholder="Enter File ID"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      />

      <input
        type="text"
        placeholder="Owner Wallet Address"
        value={ownerAddress}
        onChange={(e) => setOwnerAddress(e.target.value)}
        style={{ marginLeft: '8px', width: '320px' }}
      />

      <button onClick={checkFile}>Check File</button>
      <button onClick={refreshAccessList}>Load Access List</button>

      {message && <p style={{ color: 'orange' }}>{message}</p>}

      <div style={{ marginTop: '12px' }}>
        <h3>Grant / Revoke Access</h3>
        <input
          type="text"
          placeholder="User Wallet Address"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          style={{ width: '320px' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              grantAccess(targetAddress);
              setTargetAddress('');
            }
          }}
        />
        <button onClick={() => { grantAccess(targetAddress); setTargetAddress(''); }} disabled={loading}>Grant</button>
        <button onClick={() => { revokeAccess(targetAddress); setTargetAddress(''); }} disabled={loading} style={{ marginLeft: '6px' }}>Revoke</button>
      </div>

      {metadata && (
        <div>
          <h3>File Metadata</h3>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}

      {accessList.length > 0 && (
        <div>
          <h3>Access List</h3>
          <ul>
            {accessList.map((entry, index) => (
              <li key={index}>
                {entry.recipientAddress || entry.userAddress || entry}
                {entry.sharedAt && <span style={{ marginLeft: '8px', color: '#666' }}>since {new Date(entry.sharedAt).toLocaleString()}</span>}
                <button onClick={() => revokeAccess(entry.recipientAddress || entry.userAddress || entry)} disabled={loading}>
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
