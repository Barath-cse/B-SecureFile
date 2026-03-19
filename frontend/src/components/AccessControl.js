import React, { useState, useEffect, useCallback } from 'react';
import '../styles/AccessControl.css';

// Access control panel with improved UI for managing file permissions
function AccessControl({ userAddress }) {
  const [fileId, setFileId] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [addressInput, setAddressInput] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessList, setAccessList] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  // Key sharing states
  const [shareKeyRecipient, setShareKeyRecipient] = useState('');
  const [encryptionKeyInput, setEncryptionKeyInput] = useState('');
  const [showShareKeySection, setShowShareKeySection] = useState(false);


  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showMessage('✓ Copied to clipboard');
  };

  // Supports local dev and production: use REACT_APP_API_BASE if set, else default to same-origin /api
  const API_BASE = process.env.REACT_APP_API_BASE || '/api';

  const checkFile = async () => {
    if (!fileId.trim()) {
      showMessage('Enter a file ID', 'error');
      return;
    }
    if (!userAddress) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // First get file metadata
      console.log('Checking file:', fileId);
      const res = await fetch(`${API_BASE}/file-metadata/${fileId}`);
      if (!res.ok) throw new Error('File not found');
      const data = await res.json();
      setMetadata(data);
      
      console.log('File metadata loaded:', data);
      console.log('File owner:', data.owner, 'Current user:', userAddress);
      
      // Then get access list from shared keys
      try {
        const accessUrl = `${API_BASE}/access-list/${fileId}/${data.owner}`;
        console.log('Fetching access list from:', accessUrl);
        console.log('Owner from metadata:', data.owner);
        
        const accessRes = await fetch(accessUrl);
        console.log('Access list response status:', accessRes.status);
        
        if (accessRes.ok) {
          const accessData = await accessRes.json();
          console.log('Access list raw response:', accessData);
          
          if (accessData && accessData.accessList && Array.isArray(accessData.accessList)) {
            const usersList = accessData.accessList.map(access => access.userAddress).filter(addr => addr !== undefined);
            console.log('Extracted users list:', usersList);
            console.log(`Setting accessList to ${usersList.length} users`);
            setAccessList(usersList);
          } else {
            console.warn('No valid accessList in response, got:', accessData);
            setAccessList([]);
          }
        } else {
          console.warn('Access list endpoint error:', accessRes.status);
          const errorData = await accessRes.json();
          console.warn('Error details:', errorData);
          // Fallback to metadata.allowedUsers if available
          setAccessList(data.allowedUsers || []);
        }
      } catch (accessErr) {
        console.error('Error fetching access list:', accessErr);
        setAccessList(data.allowedUsers || []);
      }
      
      showMessage('File metadata loaded successfully');
    } catch (err) {
      console.error('Error in checkFile:', err);
      setMetadata(null);
      setAccessList([]);
      showMessage(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh access list to show users until expiry, then auto-revoke
  const refreshAccessListSilent = useCallback(async () => {
    if (!fileId.trim() || !metadata) {
      return;
    }

    try {
      const accessUrl = `${API_BASE}/access-list/${fileId}/${metadata.owner}`;
      const accessRes = await fetch(accessUrl);
      
      if (accessRes.ok) {
        const accessData = await accessRes.json();
        
        if (accessData && accessData.accessList && Array.isArray(accessData.accessList)) {
          const usersList = accessData.accessList.map(access => access.userAddress).filter(addr => addr !== undefined);
          console.log(`[Auto-Refresh] Access list updated: ${usersList.length} users`);
          
          // Check if any users were removed (expired)
          const removedUsers = accessList.filter(user => !usersList.includes(user));
          if (removedUsers.length > 0) {
            console.log(`[Auto-Revoke] Expired keys detected for: ${removedUsers.map(u => u.slice(0, 6) + '...' + u.slice(-4)).join(', ')}`);
          }
          
          setAccessList(usersList);
        } else {
          setAccessList([]);
        }
      }
    } catch (err) {
      console.warn('[Auto-Refresh] Error updating access list:', err.message);
    }
  }, [fileId, metadata, accessList]);

  // Set up auto-refresh interval when file is loaded
  useEffect(() => {
    if (!fileId.trim() || !metadata) {
      return;
    }

    console.log(`[Auto-Refresh] Starting 30-second refresh interval for file ${fileId}`);
    const interval = setInterval(() => {
      refreshAccessListSilent();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
      console.log(`[Auto-Refresh] Cleared refresh interval`);
    };
  }, [fileId, metadata, refreshAccessListSilent]);

  const grantAccess = async () => {
    if (!metadata) return;
    if (metadata.owner.toLowerCase() !== userAddress.toLowerCase()) {
      showMessage('Only owner can grant access', 'error');
      return;
    }
    if (!addressInput.trim()) {
      showMessage('Enter a valid address', 'error');
      return;
    }
    if (!addressInput.match(/^0x[a-fA-F0-9]{40}$/)) {
      showMessage('Invalid Ethereum address format', 'error');
      return;
    }
    
    setShowConfirmDialog({
      action: 'grant',
      address: addressInput,
      message: `Grant access to ${addressInput.slice(0, 6)}...${addressInput.slice(-4)}?`
    });
  };

  const confirmGrant = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/grant-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileId, 
          ownerAddress: userAddress,
          userAddress: addressInput 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Grant failed');
      showMessage(`✓ Access granted to ${addressInput.slice(0, 6)}...${addressInput.slice(-4)}`);
      setAddressInput('');
      setShowConfirmDialog(null);
      // Refresh access list
      if (!accessList.includes(addressInput)) {
        setAccessList([...accessList, addressInput]);
      }
    } catch (err) {
      console.error(err);
      showMessage(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async () => {
    if (!metadata) return;
    if (metadata.owner.toLowerCase() !== userAddress.toLowerCase()) {
      showMessage('Only owner can revoke access', 'error');
      return;
    }
    if (!addressInput.trim()) {
      showMessage('Enter a valid address', 'error');
      return;
    }
    if (!addressInput.match(/^0x[a-fA-F0-9]{40}$/)) {
      showMessage('Invalid Ethereum address format', 'error');
      return;
    }

    setShowConfirmDialog({
      action: 'revoke',
      address: addressInput,
      message: `Revoke access from ${addressInput.slice(0, 6)}...${addressInput.slice(-4)}?`
    });
  };

  const confirmRevoke = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/revoke-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileId, 
          ownerAddress: userAddress,
          userAddress: addressInput 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Revoke failed');
      showMessage(`✓ Access revoked from ${addressInput.slice(0, 6)}...${addressInput.slice(-4)}`);
      setAddressInput('');
      setShowConfirmDialog(null);
      // Update access list
      setAccessList(accessList.filter(addr => addr.toLowerCase() !== addressInput.toLowerCase()));
    } catch (err) {
      console.error(err);
      showMessage(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Share encryption key with another wallet
  const shareKey = async () => {
    if (!metadata) return;
    if (metadata.owner.toLowerCase() !== userAddress.toLowerCase()) {
      showMessage('Only owner can share encryption keys', 'error');
      return;
    }
    if (!shareKeyRecipient.trim()) {
      showMessage('Enter a valid recipient address', 'error');
      return;
    }
    if (!encryptionKeyInput.trim()) {
      showMessage('Enter the encryption key', 'error');
      return;
    }
    if (!shareKeyRecipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      showMessage('Invalid Ethereum address format', 'error');
      return;
    }

    setShowConfirmDialog({
      action: 'shareKey',
      address: shareKeyRecipient,
      message: `Share encryption key with ${shareKeyRecipient.slice(0, 6)}...${shareKeyRecipient.slice(-4)}? They will be able to decrypt the file.`
    });
  };

  const confirmShareKey = async () => {
    setLoading(true);
    try {
      const shareKeyPayload = { 
        fileId, 
        encryptionKey: encryptionKeyInput, 
        recipientAddress: shareKeyRecipient,
        ownerAddress: userAddress,
        originalFilename: metadata?.originalName || metadata?.fileName || `file-${fileId}`
      };
      
      console.log('Sharing key with payload:', shareKeyPayload);
      
      const res = await fetch(`${API_BASE}/share-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareKeyPayload)
      });
      
      const data = await res.json();
      console.log('Share key response:', data);
      
      if (!res.ok) throw new Error(data.error || 'Share failed');
      
      showMessage(`✓ Encryption key shared with ${shareKeyRecipient.slice(0, 6)}...${shareKeyRecipient.slice(-4)}!\nExpires: ${new Date(data.expiresAt).toLocaleDateString()}`);
      setShareKeyRecipient('');
      setEncryptionKeyInput('');
      setShowConfirmDialog(null);
      
      // Refresh the access list to show newly shared user
      await new Promise(resolve => setTimeout(resolve, 300));
      await checkFile();
    } catch (err) {
      console.error('Error sharing key:', err);
      showMessage(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Revoke a key share
  const revokeKeyShare = async () => {
    if (!metadata) return;
    if (metadata.owner.toLowerCase() !== userAddress.toLowerCase()) {
      showMessage('Only owner can revoke key shares', 'error');
      return;
    }
    if (!shareKeyRecipient.trim()) {
      showMessage('Enter a valid recipient address', 'error');
      return;
    }
    if (!shareKeyRecipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      showMessage('Invalid Ethereum address format', 'error');
      return;
    }

    setShowConfirmDialog({
      action: 'revokeKeyShare',
      address: shareKeyRecipient,
      message: `Revoke key share from ${shareKeyRecipient.slice(0, 6)}...${shareKeyRecipient.slice(-4)}?`
    });
  };

  const confirmRevokeKeyShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/revoke-key-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileId, 
          recipientAddress: shareKeyRecipient,
          ownerAddress: userAddress
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Revoke failed');
      showMessage(`✓ Key share revoked from ${shareKeyRecipient.slice(0, 6)}...${shareKeyRecipient.slice(-4)}`);
      setShareKeyRecipient('');
      setEncryptionKeyInput('');
      setShowConfirmDialog(null);
    } catch (err) {
      console.error(err);
      showMessage(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-control-container">
      <div className="access-card">
        <h2>🔐 Access Control Panel</h2>
        
        {/* File Lookup Section */}
        <div className="section lookup-section">
          <h3>📄 Lookup File</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter file ID (e.g., 1234567890-abc123)"
              value={fileId}
              onChange={e => setFileId(e.target.value)}
              disabled={loading}
              className="input-field"
            />
            <button onClick={checkFile} disabled={loading} className="btn btn-primary">
              {loading ? '🔄 Loading...' : '🔍 Lookup'}
            </button>
          </div>
        </div>

        {/* File Metadata Section */}
        {metadata && (
          <div className="section metadata-section">
            <h3>📋 File Details</h3>
            <div className="metadata-grid">
              <div className="metadata-item">
                <label>Owner</label>
                <div className="metadata-value">
                  <span className="badge-owner">{metadata.owner.slice(0, 6)}...{metadata.owner.slice(-4)}</span>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(metadata.owner)}
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
              </div>
              <div className="metadata-item">
                <label>File Hash</label>
                <div className="metadata-value truncated">
                  <code>{metadata.fileHash}</code>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(metadata.fileHash)}
                    title="Copy hash"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            {/* Access Users List */}
            {metadata.owner.toLowerCase() === userAddress.toLowerCase() && (
              <div className="access-users">
                <h4>👥 Users with Access ({accessList.length})</h4>
                {accessList.length > 0 ? (
                  <div className="user-list">
                    {accessList.map((addr, idx) => (
                      <div key={idx} className="user-item">
                        <span>{addr.slice(0, 6)}...{addr.slice(-4)}</span>
                        <button 
                          className="copy-btn" 
                          onClick={() => copyToClipboard(addr)}
                          title="Copy address"
                        >
                          📋
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No users have access yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Access Control Actions */}
        {metadata && metadata.owner.toLowerCase() === userAddress.toLowerCase() && (
          <>
            <div className="section action-section">
              <h3>➕ Grant/Revoke Access</h3>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Ethereum address (0x...)"
                  value={addressInput}
                  onChange={e => setAddressInput(e.target.value)}
                  disabled={loading}
                  className="input-field"
                />
                <button onClick={grantAccess} disabled={loading} className="btn btn-success">
                  ✓ Grant
                </button>
                <button onClick={revokeAccess} disabled={loading} className="btn btn-danger">
                  ✕ Revoke
                </button>
              </div>
            </div>

            <div className="section share-key-section">
              <h3>🔑 Share Encryption Key</h3>
              <button 
                onClick={() => setShowShareKeySection(!showShareKeySection)}
                className="btn btn-info"
              >
                {showShareKeySection ? '▼ Hide Key Sharing' : '▶ Show Key Sharing'}
              </button>

              {showShareKeySection && (
                <div className="share-key-form">
                  <p className="section-info">⚠️ Important: Only share the encryption key with trusted users who have blockchain access to this file.</p>
                  
                  <div className="form-group">
                    <label>Recipient Wallet Address</label>
                    <input
                      type="text"
                      placeholder="Recipient's Ethereum address (0x...)"
                      value={shareKeyRecipient}
                      onChange={e => setShareKeyRecipient(e.target.value)}
                      disabled={loading}
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>Encryption Key</label>
                    <input
                      type="text"
                      placeholder="Paste the encryption key here"
                      value={encryptionKeyInput}
                      onChange={e => setEncryptionKeyInput(e.target.value)}
                      disabled={loading}
                      className="input-field"
                    />
                    <small className="help-text">This is the encryption key from Step 1 (Upload Details)</small>
                  </div>

                  <div className="button-group">
                    <button 
                      onClick={shareKey} 
                      disabled={loading} 
                      className="btn btn-success"
                    >
                      {loading ? '⏳ Sharing...' : '🔐 Share Key'}
                    </button>
                    <button 
                      onClick={revokeKeyShare} 
                      disabled={loading} 
                      className="btn btn-danger"
                    >
                      {loading ? '⏳ Revoking...' : '❌ Revoke Key Share'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Messages */}
        {message && <div className={`message ${messageType}`}>{message}</div>}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="modal-overlay" onClick={() => setShowConfirmDialog(null)}>
            <div className="modal-dialog" onClick={e => e.stopPropagation()}>
              <h3>Confirm Action</h3>
              <p>{showConfirmDialog.message}</p>
              <div className="modal-buttons">
                <button 
                  onClick={() => setShowConfirmDialog(null)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (showConfirmDialog.action === 'grant') confirmGrant();
                    else if (showConfirmDialog.action === 'revoke') confirmRevoke();

                    else if (showConfirmDialog.action === 'shareKey') confirmShareKey();
                    else if (showConfirmDialog.action === 'revokeKeyShare') confirmRevokeKeyShare();
                  }}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '⏳ Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessControl;
