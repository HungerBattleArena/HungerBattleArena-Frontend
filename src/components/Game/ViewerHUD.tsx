import { useGame } from '../../context/GameContext';
import { VIEWER_CARDS } from '../../constants/game';

export default function ViewerHUD() {
  const { gameState, selectedRoom } = useGame();

  if (!selectedRoom || gameState.faction === null) return null;

  const cards = VIEWER_CARDS[gameState.faction];

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      <div className="w-full bg-black/50 backdrop-blur px-4 py-2 flex justify-between items-center border-b border-white/10 z-50 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="text-xs uppercase text-gray-400">Viewer Mode</div>
          <div className="text-sm font-bold text-white">{selectedRoom.name}</div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className={`status-pill ${selectedRoom.state === 'OPEN' ? 'open' : 'closed'}`}>
            {selectedRoom.state === 'OPEN' ? 'BETTING OPEN' : 'BETTING CLOSED'}
          </div>
          <div className="text-gray-400">
            Total bet: <span className="text-white">{selectedRoom.totalBet.toLocaleString()}</span>
          </div>
          <div className="text-purple-300">
            IP: <span className="text-white">{gameState.viewerIP.toLocaleString()}</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Fighter HP</span>
          <div className="w-36 h-2 bg-gray-800 border border-gray-600 skew-x-[-12deg]">
            <div
              className="w-full h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
              style={{ width: '100%' }}
            />
          </div>
          <span className="text-xs text-white font-bold">100</span>
        </div>
      </div>

      <div className="flex-grow"></div>

      <div className="w-full bg-black/40 border-t border-gray-800 px-4 py-2 pointer-events-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] mb-2">
          <div className="text-gray-400">
            Win bet<br />
            <span className="text-white font-bold">{selectedRoom.winBet.toLocaleString()}</span>
          </div>
          <div className="text-gray-400">
            Lose bet<br />
            <span className="text-white font-bold">{selectedRoom.loseBet.toLocaleString()}</span>
          </div>
          <div className="text-gray-400">
            Your bet<br />
            <span className="text-white font-bold">{gameState.userBetAmount.toLocaleString()}</span>
          </div>
          <div className="text-gray-400">
            Side<br />
            <span className="text-white font-bold">{gameState.faction}</span>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {cards.map((card) => {
            const cd = gameState.viewerCooldowns[card.id] || 0;
            const affordable = gameState.viewerIP >= card.cost;
            const pct = cd > 0 ? (cd / card.cooldown) * 100 : 0;

            return (
              <button
                key={card.id}
                id={`card-btn-${card.id}`}
                className="viewer-card-btn flex-shrink-0 w-24 h-32 bg-gray-900 border border-gray-700 hover:border-white transition flex flex-col items-center justify-center gap-2 rounded relative overflow-hidden"
                disabled={!affordable || cd > 0}
                style={{ opacity: affordable ? 1 : 0.5 }}
              >
                <div className="text-3xl relative z-10">{card.icon}</div>
                <div className={`text-[10px] font-bold text-center leading-tight ${card.color} relative z-10`}>
                  {card.name}
                </div>
                <div className="text-[9px] text-gray-500 text-center px-1 relative z-10">{card.desc}</div>
                <div className="absolute bottom-1 right-2 text-[10px] text-white font-mono font-bold bg-black/50 px-1 rounded z-10">
                  {card.cost}
                </div>
                <div className="cooldown-overlay" style={{ height: `${pct}%` }}></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

