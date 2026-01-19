import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setGameState } from '../../store/gameSlice';

export default function ViewerBet() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selectedRoom = useAppSelector((state) => state.game.selectedRoom);
  const setGameStateAction = (updates: Parameters<typeof setGameState>[0]) => {
    dispatch(setGameState(updates));
  };
  const [selectedBetSide, setSelectedBetSide] = useState<'WIN' | 'LOSE' | null>(null);
  const [betAmount, setBetAmount] = useState('');

  if (!selectedRoom) {
    navigate('/viewer-rooms');
    return null;
  }

  const lockBetAndEnter = () => {
    if (selectedRoom.status !== 'OPEN') {
      alert('Betting is closed.');
      return;
    }
    if (!selectedBetSide) {
      alert('Select WIN or LOSE.');
      return;
    }
    const amount = parseInt(betAmount, 10);
    if (!amount || amount <= 0) {
      alert('Enter a valid bet amount.');
      return;
    }
    setGameStateAction({
      role: 'VIEWER',
      faction: selectedBetSide,
      userBetAmount: amount,
    });
    navigate(`/view-game?room=${selectedRoom.match_id}`);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-black/95">
      <div className="glass-panel w-full max-w-4xl p-10 relative fade-in">
        <button className="absolute top-6 left-6 text-white z-50 hover:text-cyan-400 transition" onClick={() => navigate('/viewer-rooms')}>
          ← Change room
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-6 mb-8">
          <div>
            <h2 className="text-4xl font-black text-white">{selectedRoom.name}</h2>
            <p className="text-gray-400 mt-1">Lock your bet before the fighter starts.</p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-gray-500">Total bet</div>
            <div className="text-3xl text-gold-400 font-mono">{selectedRoom.total_bet_viewers.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`bet-side-card p-6 rounded-lg ${selectedBetSide === 'WIN' ? 'selected' : ''}`}
            onClick={() => setSelectedBetSide('WIN')}
          >
            <h3 className="text-3xl text-cyan-400 font-bold">WIN</h3>
            <p className="text-sm text-gray-400 mt-2">Fighter survives</p>
            <div className="text-xs text-gray-500 mt-4">Bet pool</div>
            <div className="text-xl text-white font-bold">{selectedRoom.win_bets_total.toLocaleString()}</div>
          </div>
          <div
            className={`bet-side-card p-6 rounded-lg ${selectedBetSide === 'LOSE' ? 'selected' : ''}`}
            onClick={() => setSelectedBetSide('LOSE')}
          >
            <h3 className="text-3xl text-pink-400 font-bold">LOSE</h3>
            <p className="text-sm text-gray-400 mt-2">Fighter is eliminated</p>
            <div className="text-xs text-gray-500 mt-4">Bet pool</div>
            <div className="text-xl text-white font-bold">{selectedRoom.lose_bets_total.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
          <input
            id="viewer-bet-amount"
            className="input-cyber w-full rounded"
            placeholder="Enter bet amount"
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          <button
            id="btn-lock-bet"
            className="btn-cyber px-10 py-3 text-lg font-bold w-full md:w-auto text-nowrap"
            onClick={lockBetAndEnter}
          >
            Lock Bet
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-500">Betting closes when the fighter starts the match.</div>
      </div>
    </div>
  );
}
