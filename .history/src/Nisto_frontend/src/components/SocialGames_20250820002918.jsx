import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiAward, FiUsers, FiTarget, FiTrendingUp, FiGift, FiPlay, FiCheck } from 'react-icons/fi';

export default function SocialGames() {
  const { isAuthenticated, isLoading, getAvailableGames, getUserGames, joinGame } = useAuth();
  const { showToast } = useNotification();
  const [games, setGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        if (getAvailableGames) {
          const available = await getAvailableGames();
          setGames(available || []);
        }
        if (getUserGames) {
          const mine = await getUserGames();
          setUserGames(mine || []);
        }
      } catch (err) {
        showToast({ message: 'Failed to load games', type: 'error', icon: <FiGift /> });
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
    // eslint-disable-next-line
  }, []);

  const handleJoin = async (gameId) => {
    if (!joinGame) return;
    try {
      await joinGame(gameId);
      showToast({ message: 'Joined game!', type: 'success', icon: <FiCheck /> });
      // Refresh user games
      if (getUserGames) {
        const mine = await getUserGames();
        setUserGames(mine || []);
      }
    } catch (err) {
      showToast({ message: 'Failed to join game', type: 'error', icon: <FiGift /> });
    }
  };

  if (loading) return <div>Loading social games...</div>;

  return (
    <div className="social-games-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', minHeight: 200 }}>
      <div style={{ textAlign: 'center', padding: '24px 16px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 12, maxWidth: 420 }}>
        <FiAward size={28} style={{ opacity: 0.8 }} />
        <h3 style={{ marginTop: 8 }}>Social Games</h3>
        <p style={{ opacity: 0.8, marginTop: 4 }}>Coming soon. We’re crafting fun social trading experiences. Stay tuned!</p>
      </div>
    </div>
  );
} 