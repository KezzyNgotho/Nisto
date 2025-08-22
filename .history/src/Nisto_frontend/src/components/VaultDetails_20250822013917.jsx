import React from 'react';
import { FiUsers, FiDollarSign, FiCalendar, FiEye } from 'react-icons/fi';

const VaultDetails = ({ vault, onClose }) => {
  if (!vault) return null;

  return (
    <div className="vault-details-modal">
      <div className="modal-header">
        <h3>{vault.name}</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="modal-body">
        <div className="vault-info">
          <div className="info-row">
            <FiUsers />
            <span>Members: {vault.memberCount || 0}</span>
          </div>
          <div className="info-row">
            <FiDollarSign />
            <span>Balance: {vault.balance || '0'} {vault.currency || 'NST'}</span>
          </div>
          <div className="info-row">
            <FiCalendar />
            <span>Created: {vault.createdAt ? new Date(vault.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>
        
        <div className="vault-description">
          <p>{vault.description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );
};

export default VaultDetails;
