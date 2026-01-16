import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

export default function ViewerRooms() {
  const navigate = useNavigate();
  const { activeRooms, setSelectedRoom } = useGame();

  const selectRoom = (room: typeof activeRooms[0]) => {
    if (room.state === 'CLOSED') return;
    setSelectedRoom(room);
    navigate('/viewer-bet');
  };

  return (
    <div className="absolute inset-0 bg-black/95 pointer-events-auto z-50 flex flex-col items-center justify-center fade-in">
      <div className="w-full max-w-7xl px-8 mb-4 flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black glitch-text text-white" data-text="VIEWER ROOMS">
            VIEWER ROOMS
          </h1>
          <p className="text-gray-400 tracking-widest uppercase text-sm mt-2">
            Pick a room to lock your bet
          </p>
        </div>
      </div>

      <div className="w-full max-w-7xl h-[65vh] overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeRooms.map((room) => {
          const isClosed = room.state === 'CLOSED';
          return (
            <div
              key={room.id}
              className={`room-card glass-panel p-6 flex flex-col gap-4 relative ${isClosed ? 'disabled' : ''}`}
              onClick={() => selectRoom(room)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs text-gray-500 font-mono">{room.id}</div>
                  <h3 className="text-2xl text-white font-bold">{room.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">TOTAL BET</div>
                  <div className="text-gold-400 font-bold">{room.totalBet.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-black/40 p-3 rounded border border-cyan-500/30">
                  <div className="text-cyan-400">WIN</div>
                  <div className="text-white font-bold">{room.winBet.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{room.winCount} bettors</div>
                </div>
                <div className="bg-black/40 p-3 rounded border border-pink-500/30">
                  <div className="text-pink-400">LOSE</div>
                  <div className="text-white font-bold">{room.loseBet.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{room.loseCount} bettors</div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
                <div className={`status-pill ${isClosed ? 'closed' : 'open'}`}>
                  {isClosed ? 'BETTING CLOSED' : 'BETTING OPEN'}
                </div>
                <div className="text-xs text-gray-500">{isClosed ? 'CLOSED' : 'OPEN'}</div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="absolute top-6 left-6 text-xl text-gray-400 hover:text-white z-50 flex items-center gap-2 font-tech"
        onClick={() => navigate('/')}
      >
        <span>‹</span> RETURN TO MENU
      </button>
    </div>
  );
}

