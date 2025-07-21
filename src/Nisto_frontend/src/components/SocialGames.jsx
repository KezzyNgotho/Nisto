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
    <div className="social-games-container">
      <div className="social-games-header">
        <FiAward className="social-games-icon" />
        <h3>Social Games</h3>
      </div>
      <div className="social-games-list">
        {games.length === 0 ? (
          <div>No games available right now.</div>
        ) : games.map(game => (
          <div key={game.id} className="social-game-card">
            <div className="game-title">{game.name}</div>
            <div className="game-desc">{game.description}</div>
            <div className="game-meta">
              <span><FiUsers /> {game.currentParticipants} / {game.maxParticipants || '∞'} players</span>
              <span><FiTarget /> Prize: {game.prizePool} {game.currency}</span>
              <span><FiTrendingUp /> Status: {game.status}</span>
            </div>
            {userGames.some(g => g.id === game.id) ? (
              <button className="btn btn-success" disabled><FiCheck /> Joined</button>
            ) : (
              <button className="btn btn-primary" onClick={() => handleJoin(game.id)}><FiPlay /> Join Game</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 