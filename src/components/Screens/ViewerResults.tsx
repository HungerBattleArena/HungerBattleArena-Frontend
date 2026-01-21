import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import useGetPreviewReward from '../../hooks/query/useGetPreviewReward';
import useClaimViewerReward from '../../hooks/mutation/viewer/useClaimViewerReward';
import useMatchInfo from '../../hooks/query/useMatchInfo';

interface ViewerResultsProps {
  victory: boolean;
  isOpen: boolean;
}

export default function ViewerResults({ victory, isOpen }: ViewerResultsProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');
  const { data: previewReward } = useGetPreviewReward();
  const { mutateAsync: claimReward } = useClaimViewerReward();
  const { data: selectedRoom } = useMatchInfo(matchId || undefined);

  const gameState = useAppSelector((state) => state.game.gameState);
  const [animatedValues, setAnimatedValues] = useState({
    totalPool: 0,
    fighterReward: 0,
    viewerPool: 0,
    userPayout: 0,
  });

  const winningSide = victory ? 'WIN' : 'LOSE';
  const userWon = gameState.faction === winningSide;
  const totalPool = parseInt(selectedRoom?.total_bet_viewers || '0', 10);
  const fighterReward = victory ? Math.floor(totalPool * 0.15) : 0;
  const viewerWinPool = totalPool - fighterReward;
  const userBet = gameState.userBetAmount || 0;
  const totalBetSideWin =
    winningSide === 'WIN' ? parseInt(selectedRoom?.win_bets_total || '0', 10) : parseInt(selectedRoom?.lose_bets_total || '0', 10);
  const share = totalBetSideWin > 0 ? userBet / totalBetSideWin : 0;
  const userPayout = userWon ? Math.floor(share * viewerWinPool) : 0;
  const pnl = userWon ? userBet : -userBet;

  const handleClaim = async () => {
    await claimReward({ vaultId: selectedRoom?.vault_id || '' });
  };

  useEffect(() => {
    // Animate values
    const animate = (key: keyof typeof animatedValues, target: number, delay: number) => {
      setTimeout(() => {
        let current = 0;
        const step = target / 60;
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          setAnimatedValues((prev) => ({
            ...prev,
            [key]: Math.floor(current),
          }));
        }, 16);
      }, delay);
    };

    animate('totalPool', totalPool, 0);
    animate('fighterReward', fighterReward, 500);
    animate('viewerPool', viewerWinPool, 1000);
    animate('userPayout', userPayout, 1500);
  }, [totalPool, fighterReward, viewerWinPool, userPayout]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/95 pointer-events-auto z-60 flex flex-col items-center justify-center fade-in">
      <h1
        className={`text-6xl md:text-8xl font-black mb-2 glitch-text tracking-wider ${winningSide === 'WIN' ? 'text-cyan-400' : 'text-pink-500'
          }`}
        data-text={winningSide === 'WIN' ? 'WIN SIDE PAID' : 'LOSE SIDE PAID'}
      >
        {winningSide === 'WIN' ? 'WIN SIDE PAID' : 'LOSE SIDE PAID'}
      </h1>
      <p className={`text-xl mb-12 tracking-[0.5em] uppercase ${userWon ? 'text-green-400' : 'text-red-500'}`}>
        {userWon ? 'PAYOUT CONFIRMED' : 'BET LOST'}
      </p>

      <div className="flex flex-col md:flex-row gap-12 w-full max-w-5xl">
        <div
          className={`w-full md:w-1/2 glass-panel p-8 border-l-4 ${winningSide === 'WIN' ? 'border-cyan-500 win-glow-savior' : 'border-pink-500 win-glow-doomer'
            } transition duration-1000`}
        >
          <h3 className="text-2xl text-cyan-400 mb-6 border-b border-gray-700 pb-2">POOL SUMMARY</h3>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">TOTAL POOL</span>
              <span className="text-white text-lg">{animatedValues.totalPool.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">WINNING SIDE POOL</span>
              <span className="text-green-400 text-xl font-bold">{animatedValues.viewerPool.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 glass-panel p-8 border-l-4 border-gold-400 relative overflow-hidden">
          <h3 className="text-2xl text-gold-400 mb-6 border-b border-gray-700 pb-2">YOUR PAYOUT</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-sm">INITIAL BET</span>
              <span className="text-white font-mono">{userBet.toLocaleString()}</span>
            </div>
            <div className="bg-black/40 p-4 border border-gray-700 rounded text-center">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total reward</div>
              <div className="text-5xl font-black text-white">{previewReward?.toLocaleString() ?? '0'}</div>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-sm">PNL</span>
              <span className={`font-mono text-xl ${pnl >= 0 ? 'text-green-400' : 'text-red-500'}`}>{pnl.toLocaleString()}</span>
            </div>
            {pnl > 0 && (
              <button className="btn-cyber px-10 py-3 text-lg font-bold" onClick={handleClaim}>
                Claim
              </button>
            )}
          </div>
        </div>
      </div>

      <button className="btn-cyber px-12 py-4 mt-16 text-xl font-bold" onClick={() => navigate('/')}>
        Return to Lobby
      </button>
    </div>
  );
}
