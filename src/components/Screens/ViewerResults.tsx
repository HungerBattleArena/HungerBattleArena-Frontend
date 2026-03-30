import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useClaimViewerReward from '../../hooks/mutation/viewer/useClaimViewerReward';
import useMatchInfo from '../../hooks/query/useMatchInfo';
import { useAppSelector } from '../../store/hooks';
import { BN } from '../../utils/utils';
import { useMemo } from 'react';

interface ViewerResultsProps {
  isVictory: boolean;
  isFighterWin: boolean;
  isOpen: boolean;
}

export default function ViewerResults({ isVictory, isFighterWin, isOpen }: ViewerResultsProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');
  const { mutateAsync: claimReward } = useClaimViewerReward();
  const { data: selectedRoom } = useMatchInfo(matchId || undefined);
  const gameState = useAppSelector((state) => state.game.gameState);

  const totalPool = !isFighterWin ? BN(selectedRoom?.win_bets_total) : BN(selectedRoom?.lose_bets_total);
  const fighterReward = isFighterWin ? BN(totalPool).multipliedBy(0.2).toNumber() : 0;
  const userBet = gameState.userBetAmount || 0;

  const viewerGross = useMemo(() => {
    if (!selectedRoom) return BN(0);

    if (isFighterWin) {
      const a = BN(userBet).dividedBy(selectedRoom.win_bets_total);
      const result = a.multipliedBy(0.8).multipliedBy(selectedRoom.lose_bets_total);
      return result;
    } else {
      const a = BN(userBet).dividedBy(selectedRoom.lose_bets_total);
      const result = a.multipliedBy(selectedRoom.win_bets_total);
      return result;
    }
  }, [isFighterWin, selectedRoom, userBet]);

  const viewerNet = (() => {
    return BN(userBet).plus(viewerGross).multipliedBy(0.98);
  })();

  const pnl = Number(viewerNet.minus(userBet).toFixed(4));

  const handleClaim = async () => {
    try {
      await claimReward({ vaultId: selectedRoom?.vault_id || '', matchId: selectedRoom?.match_id || '' });
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to claim reward');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/95 pointer-events-auto z-60 flex flex-col items-center justify-center fade-in">
      <h1
        className={`text-6xl md:text-8xl font-black mb-2 glitch-text tracking-wider ${isVictory ? 'text-cyan-400' : 'text-pink-500'}`}
        data-text={isVictory ? 'WIN SIDE PAID' : 'LOSE SIDE PAID'}
      >
        {isVictory ? 'WIN SIDE PAID' : 'LOSE SIDE PAID'}
      </h1>
      <p className={`text-xl mb-12 tracking-[0.5em] uppercase ${isVictory ? 'text-green-400' : 'text-red-500'}`}>
        {isVictory ? 'PAYOUT CONFIRMED' : 'BET LOST'}
      </p>

      <div className="flex flex-col md:flex-row gap-12 w-full max-w-5xl">
        <div
          className={`w-full md:w-1/2 glass-panel p-8 border-l-4 ${
            isVictory ? 'border-cyan-500 win-glow-savior' : 'border-pink-500 win-glow-doomer'
          } transition duration-1000`}
        >
          <h3 className="text-2xl text-cyan-400 mb-6 border-b border-gray-700 pb-2">POOL SUMMARY</h3>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">TOTAL POOL</span>
              <span className="text-white text-lg">{totalPool.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fighter reward (20%)</span>
              <span className="text-yellow-400 text-xl font-bold">{fighterReward.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">WINNING SIDE POOL</span>
              <span className="text-green-400 text-xl font-bold">{selectedRoom?.win_bets_total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">LOSING SIDE POOL</span>
              <span className="text-red-300 text-xl font-bold">{selectedRoom?.lose_bets_total}</span>
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
              <div className="text-5xl font-black text-white">{viewerNet.toFixed(4) ?? '0'}</div>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-sm">PNL</span>
              <span className={`font-mono text-xl ${pnl >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                {pnl.toLocaleString()}
              </span>
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
