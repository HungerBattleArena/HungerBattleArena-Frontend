import React, { useCallback, useEffect } from 'react';
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

  const fighterReward = BN(matchInfo?.total_pool || 0)
    .multipliedBy(0.1)
    .multipliedBy(0.95); //  10% of total pool as reward minus 5% fee
  console.log('Calculated fighterReward in dialog', fighterReward);
  console.log('total_pool in dialog', matchInfo?.total_pool);

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

          <p>Your reward: {fighterReward.toString()}</p>

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
