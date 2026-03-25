import React, { useCallback, useEffect, useMemo } from 'react';
import useFighterClaim from '../../hooks/mutation/match/useFighterClaim';
import useEndMatch from '../../hooks/mutation/match/useEndMatch';
import type { TMatchInfo } from '../../types/game';
import { BN } from '../../utils/utils';

interface HostWinResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerName?: string;
  matchInfo?: TMatchInfo | null;
}

const HostWinResultDialog: React.FC<HostWinResultDialogProps> = ({ isOpen, onClose, playerName, matchInfo }) => {
  const { mutateAsync: claimFighterReward } = useFighterClaim();
  const { mutateAsync: endMatch } = useEndMatch();

  const fighterGross = useMemo(() => {
    if (!matchInfo) return BN(0);
    return BN(matchInfo.fighter_stake || 0).plus(BN(matchInfo.lose_bets_total).multipliedBy(0.2));
  }, [matchInfo]);

  const fighterNet = useMemo(() => {
    return fighterGross.multipliedBy(0.95);
  }, [fighterGross]);

  const handleClaimReward = async () => {
    await claimFighterReward({ matchId: matchInfo?.match_id, vaultId: matchInfo?.vault_id || undefined });
    onClose();
  };

  const handleEndMatch = useCallback(async () => {
    await endMatch({ isWin: true, matchId: matchInfo?.match_id || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOpen) {
      handleEndMatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto z-50 flex items-center justify-center fade-in"
      onClick={onClose}
    >
      <div className="glass-panel w-full max-w-lg p-10 relative fade-in" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-white transition-colors z-50"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🏆</div>

          <h2
            className="text-4xl font-black text-green-500 mb-2 font-tech"
            style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8)' }}
          >
            VICTORY!
          </h2>

          {playerName && (
            <p className="text-xl text-gray-300 mb-4">
              <span className="text-yellow-400 font-bold">{playerName}</span> has won the battle!
            </p>
          )}

          <div className="h-px bg-linear-to-r from-transparent via-gray-600 to-transparent my-6"></div>

          <p className="text-gray-400 text-sm">Congratulations on your triumph!</p>

          <div className="w-full max-w-md mx-auto text-left">
            <div className="rounded-lg border border-gray-700/80 bg-black/40 p-5 ">
              <h3 className="text-xl text-cyan-400 mb-4 border-b border-gray-700 pb-2 font-tech">REWARD BREAKDOWN</h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between items-end gap-4">
                  <span className="text-gray-400 text-sm uppercase tracking-wide">Initial stake</span>
                  <span className="text-white text-lg tabular-nums">
                    {BN(matchInfo?.fighter_stake || 10).toFixed(2)}
                  </span>
                </div>
                <div className="bg-black/40 p-4 border border-gray-700 rounded text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total reward</div>
                  <div className="text-4xl font-black text-white tabular-nums">{fighterNet.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-end gap-4">
                  <span className="text-gray-400 text-sm uppercase tracking-wide">Your reward</span>
                  <span className="text-green-400 text-xl font-bold tabular-nums">
                    {fighterNet.minus(matchInfo?.fighter_stake || 10).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button className="btn-cyber px-8 py-3 text-lg font-bold" onClick={handleClaimReward}>
              Claim Reward
            </button>

            <button className="btn-cyber px-8 py-3 text-lg font-bold" onClick={onClose}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostWinResultDialog;
