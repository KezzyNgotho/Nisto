import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiShoppingCart,
  FiUser,
  FiGlobe,
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX
} from 'react-icons/fi';

const typeIcons = {
  'M-Pesa': <FiSmartphone />, 'Card': <FiCreditCard />, 'Bank': <FiDollarSign />, 'Cash': <FiShoppingCart />, 'Online': <FiGlobe />
};
const providerOptions = [
  'Mpesa', 'AirtelMoney', 'Equitel', 'BankTransfer', 'Card', 'PayPal', 'Custom'
];

const LocalPaymentMethods = () => {
  const { isAuthenticated, isLoading: authLoading, backend } = useAuth();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    provider: '',
    accountNumber: '',
    phoneNumber: '',
    accountName: '',
    isDefault: false
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await backend.getUserPaymentMethods();
      setMethods(res || []);
    } catch (err) {
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated) fetchMethods(); }, [isAuthenticated]);

  const openAdd = () => {
    setEditing(null);
    setForm({ provider: '', accountNumber: '', phoneNumber: '', accountName: '', isDefault: false });
    setShowModal(true);
  };
  const openEdit = (method) => {
    setEditing(method);
    setForm({
      provider: method.provider,
      accountNumber: method.accountNumber || '',
      phoneNumber: method.phoneNumber || '',
      accountName: method.accountName,
      isDefault: method.isDefault
    });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ provider: '', accountNumber: '', phoneNumber: '', accountName: '', isDefault: false });
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await backend.updatePaymentMethod(editing.id, form.accountNumber, form.phoneNumber, form.accountName, form.isDefault);
      } else {
        await backend.addPaymentMethod(form.provider, form.accountNumber, form.phoneNumber, form.accountName, form.isDefault);
      }
      await fetchMethods();
      closeModal();
    } catch (err) {
      setError('Failed to save payment method');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this payment method?')) return;
    setSubmitting(true);
    try {
      await backend.removePaymentMethod(id);
      await fetchMethods();
    } catch (err) {
      setError('Failed to remove payment method');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div style={{ color: 'var(--primary-600)', textAlign: 'center', marginTop: 32 }}>Please log in to manage payment methods.</div>;

  return (
    <div className="payment-methods-container">
      <h2>Local Payment Methods</h2>
      {loading && <div style={{ color: 'var(--primary-600)' }}>Loading...</div>}
      {error && <div style={{ color: 'var(--error-600)', marginBottom: 8 }}>{error}</div>}
      <ul className="payment-methods-list">
        {methods.map((method) => (
          <li key={method.id} className="payment-method-card">
            <h3>{method.accountName}</h3>
            <div className="meta"><FiUser /> {method.phoneNumber || method.accountNumber || 'N/A'}</div>
            <div className="types">
              <span className="type-icon">{typeIcons[method.provider] || <FiCreditCard />} {method.provider}</span>
              {method.isDefault && <span className="type-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}><FiCheck /> Default</span>}
            </div>
            <div className="payment-method-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(method)}><FiEdit2 /></button>
              <button className="btn btn-outline btn-sm" onClick={() => handleDelete(method.id)}><FiTrash2 /></button>
            </div>
          </li>
        ))}
      </ul>
      <button className="btn btn-primary fab" onClick={openAdd} style={{ position: 'fixed', bottom: 32, right: 32, borderRadius: '50%', width: 56, height: 56, fontSize: 24, zIndex: 200 }} title="Add Payment Method"><FiPlus /></button>
      {showModal && (
        <div className="modal-overlay">
          <form className="modal" style={{ maxWidth: 400, minWidth: 280 }} onSubmit={handleSubmit}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
              <button className="modal-close" onClick={closeModal} type="button"><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>Provider
                <select name="provider" value={form.provider} onChange={handleChange} required disabled={!!editing}>
                  <option value="">Select provider</option>
                  {providerOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label>Account Name
                <input name="accountName" value={form.accountName} onChange={handleChange} required placeholder="e.g. My M-Pesa" />
              </label>
              <label>Account Number
                <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="(optional)" />
              </label>
              <label>Phone Number
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="(optional)" />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} /> Default
              </label>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LocalPaymentMethods; 