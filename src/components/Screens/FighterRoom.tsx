import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

export default function FighterRoom() {
  const navigate = useNavigate();
  const { fighterRoom, setFighterRoom, setGameState } = useGame();
  const [roomName, setRoomName] = useState('');

  const openFighterRoom = () => {
    const name = roomName.trim() || 'Fighter Room';
    setFighterRoom({
      ...fighterRoom,
      name,
      state: 'OPEN',
      totalBet: 8400,
      winBet: 5200,
      loseBet: 3200,
      winCount: 38,
      loseCount: 24
    });
  };

  const startMatchAsFighter = () => {
    setFighterRoom({ ...fighterRoom, state: 'CLOSED' });
    setGameState({ role: 'FIGHTER' });
    navigate('/game');
  };

  const isOpen = fighterRoom.state === 'OPEN';

  return (
    <div className="absolute inset-0 bg-black/90 pointer-events-auto z-50 flex items-center justify-center">
      <div className="glass-panel w-full max-w-5xl p-10 relative fade-in">
        <button
          className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-white z-50"
          onClick={() => navigate('/')}
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl text-cyan-400 mb-2">Create Room</h3>
              <p className="text-sm text-gray-400">Name your room and open betting.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500">Room name</label>
              <input
                id="fighter-room-name"
                className="input-cyber w-full rounded"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>

            <div className="bg-black/40 border border-gray-800 rounded p-4 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Default Fighter</span>
                <span className="text-white">Neon Ronin</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Default Weapon</span>
                <span className="text-white">Combat Knife</span>
              </div>
            </div>

            <button className="btn-cyber px-8 py-3 text-lg font-bold w-full" onClick={openFighterRoom}>
              Open Room
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-3xl text-white mb-2">Room Status</h3>
              <p className="text-sm text-gray-400">Track bettors before starting.</p>
            </div>

            <div className="glass-panel p-6 space-y-4 border border-gray-800">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Room</div>
                <div className="text-lg text-white font-bold">{fighterRoom.name}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Status</div>
                <div className={`status-pill ${isOpen ? 'open' : 'closed'}`}>
                  {isOpen ? 'BETTING OPEN' : 'BETTING CLOSED'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-black/40 p-3 rounded border border-gray-800">
                  <div className="text-gray-500">Total bettors</div>
                  <div className="text-xl text-white font-bold">
                    {(fighterRoom.winCount + fighterRoom.loseCount).toLocaleString()}
                  </div>
                </div>
                <div className="bg-black/40 p-3 rounded border border-gray-800">
                  <div className="text-gray-500">Total bet</div>
                  <div className="text-xl text-gold-400 font-bold">
                    {fighterRoom.totalBet.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-black/40 p-3 rounded border border-cyan-500/30">
                  <div className="text-cyan-400">WIN side</div>
                  <div className="text-white font-bold">{fighterRoom.winBet.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{fighterRoom.winCount} bettors</div>
                </div>
                <div className="bg-black/40 p-3 rounded border border-pink-500/30">
                  <div className="text-pink-400">LOSE side</div>
                  <div className="text-white font-bold">{fighterRoom.loseBet.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{fighterRoom.loseCount} bettors</div>
                </div>
              </div>
            </div>

            <button
              id="btn-start-match"
              className="btn-cyber px-8 py-3 text-lg font-bold w-full"
              onClick={startMatchAsFighter}
            >
              Start Match
            </button>
            <p className="text-xs text-gray-500">Start when you feel there are enough bettors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

