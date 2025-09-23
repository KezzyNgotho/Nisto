import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FiArrowUpRight, FiArrowDownLeft, FiClock } from 'react-icons/fi';

const TransactionHistory = () => {
  const { theme } = useTheme();

  // Mock transaction data - replace with real data later
  const transactions = [
    {
      id: 1,
      type: 'send',
      amount: '0.05 ETH',
      value: '$150.25',
      to: '0x1234...5678',
      timestamp: '2024-03-22 14:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'receive',
      amount: '0.002 BTC',
      value: '$89.50',
      from: '0x8765...4321',
      timestamp: '2024-03-22 12:15',
      status: 'completed'
    },
    // Add more mock transactions as needed
  ];

  return (
    <div className="transaction-history" style={{
      backgroundColor: theme.colors.background?.secondary || theme.colors.background,
      borderRadius: '1rem',
      padding: '1.5rem',
      border: `1px solid ${theme.colors.border.primary}`
    }}>
      <h3 style={{ 
        color: theme.colors.text.primary,
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1.5rem'
      }}>
        Transaction History
      </h3>

      <div className="transactions-list" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {transactions.map(transaction => (
          <div key={transaction.id} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: theme.colors.background?.primary || theme.colors.background,
            borderRadius: '0.75rem',
            border: `1px solid ${theme.colors.border.primary}`
          }}>
            {/* Transaction Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: transaction.type === 'send' ? `${theme.colors.error}15` : `${theme.colors.success}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              {transaction.type === 'send' ? (
                <FiArrowUpRight size={20} color={theme.colors.error} />
              ) : (
                <FiArrowDownLeft size={20} color={theme.colors.success} />
              )}
            </div>

            {/* Transaction Details */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem'
              }}>
                <span style={{
                  color: theme.colors.text.primary,
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {transaction.type === 'send' ? 'Sent' : 'Received'} {transaction.amount}
                </span>
                <span style={{
                  color: transaction.type === 'send' ? theme.colors.error : theme.colors.success,
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {transaction.type === 'send' ? '-' : '+'}{transaction.value}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  color: theme.colors.text.secondary,
                  fontSize: '0.75rem'
                }}>
                  {transaction.type === 'send' ? `To: ${transaction.to}` : `From: ${transaction.from}`}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: theme.colors.text.secondary,
                  fontSize: '0.75rem'
                }}>
                  <FiClock size={12} />
                  {transaction.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
