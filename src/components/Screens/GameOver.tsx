import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface GameOverProps {
  victory: boolean;
}

export default function GameOver({ victory }: GameOverProps) {
  const navigate = useNavigate();
  const fighterRoom = useAppSelector((state) => state.game.fighterRoom);

  const pool = parseInt(fighterRoom.total_bet_viewers || '0', 10);
  const reward = victory ? Math.floor(pool * 0.15) : 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-60 pointer-events-auto">
      <h1 className={`text-6xl font-black mb-4 ${victory ? 'text-green-400' : 'text-red-600'}`}>{victory ? 'SURVIVED' : 'ELIMINATED'}</h1>
      <p className="text-gray-400 mb-6">{victory ? 'Fighter survived the arena.' : 'Fighter was eliminated.'}</p>

      {victory && (
        <div className="glass-panel p-6 mb-8 w-full max-w-md text-center">
          <div className="text-xs uppercase tracking-widest text-gray-500">Fighter reward (15%)</div>
          <div className="text-4xl text-gold-400 font-black mt-2">{reward.toLocaleString()}</div>
          <button className="btn-cyber px-8 py-3 mt-4">Claim Reward</button>
        </div>
      )}

      <button className="btn-cyber px-8 py-3" onClick={() => navigate('/')}>
        Return to Lobby
      </button>
    </div>
  );
}
