import React, { useState } from 'react';
import { Nisto_backend } from '../../../declarations/Nisto_backend';

const assets = [
  { asset: 'USDT', networks: ['ERC20', 'TRC20'] },
  { asset: 'BTC', networks: ['BTC'] },
  // Add more as needed
];

export default function DepositAddress() {
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState('ERC20');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAddress = async () => {
    setLoading(true);
    setError('');
    setAddress('');
    try {
      const result = await Nisto_backend.getExternalDepositAddress(selectedAsset, selectedNetwork);
      if (result.ok) {
        setAddress(result.ok);
      } else {
        setError(result.err || 'Failed to fetch address');
      }
    } catch (e) {
      setError('Error fetching address');
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Deposit section removed as requested */}
    </div>
  );
}
