import React from 'react';
import { useNavigate } from 'react-router-dom';
import useClaimCancelStake from '../../hooks/mutation/match/useClaimCancelStake';
import useDefaultFighterStake from '../../hooks/query/useDefaultFighterStake';
import useMatchInfo from '../../hooks/query/useMatchInfo';
import { useAppSelector } from '../../store/hooks';

export interface DialogFighterReStakeProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const DialogFighterReStake: React.FC<DialogFighterReStakeProps> = ({ isOpen, onClose, isLoading }) => {
  const navigate = useNavigate();
  const { data: stakeAmount } = useDefaultFighterStake();
  const { mutateAsync: claimCancelStake, isPending: isClaiming } = useClaimCancelStake();
  const fighterRoom = useAppSelector((state) => {
    return state.game.fighterRoom;
  });
  const { data: matchInfo, refetch } = useMatchInfo(fighterRoom.match_id);
  if (!isOpen) return null;

  const displayAmount = stakeAmount || 10;
  const onClaim = async () => {
    await claimCancelStake({
      matchId: matchInfo?.match_id,
      vaultId: matchInfo?.vault_id,
    });

    navigate('/');
  };

  return (
    <div
      className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto z-50 flex items-center justify-center fade-in px-4"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="presentation"
    >
      <div
        className="glass-panel w-full max-w-lg p-8 md:p-10 relative fade-in border border-cyan-400/20 shadow-[0_0_40px_rgba(0,243,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
        aria-busy={isLoading}
      >
        {isLoading && (
          <div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 rounded-[inherit] bg-black/55 backdrop-blur-sm fade-in"
            role="status"
            aria-live="polite"
          >
            <div className="relative w-12 h-12 shrink-0">
              <div
                className="absolute inset-0 rounded-full border-2 border-gray-700"
                style={{ borderTopColor: 'transparent' }}
              />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: '#06b6d4',
                  borderRightColor: '#06b6d4',
                }}
              />
            </div>
            <p className="font-tech text-sm uppercase tracking-[0.25em] text-cyan-400/90">Loading</p>
          </div>
        )}

        <button
          type="button"
          className="absolute top-5 right-5 md:top-6 md:right-6 text-2xl md:text-3xl text-gray-400 hover:text-white transition-colors z-50 leading-none disabled:opacity-40 disabled:pointer-events-none"
          onClick={onClose}
          aria-label="Close dialog"
          disabled={isLoading}
        >
          ✕
        </button>

        <div className={`text-center space-y-6 ${isLoading ? 'pointer-events-none select-none opacity-40' : ''}`}>
          <div
            className="text-5xl md:text-6xl mb-2 font-black text-cyan-400 font-tech"
            style={{ textShadow: '0 0 24px rgba(6, 182, 212, 0.6)' }}
            aria-hidden
          >
            ◆
          </div>

          <div>
            <h2
              className="text-2xl md:text-3xl font-black text-white mb-2 font-tech tracking-tight"
              style={{ textShadow: '0 0 16px rgba(255, 255, 255, 0.25)' }}
            >
              STAKE AVAILABLE
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed px-1">
              Your match was canceled under conditions that refund the fighter stake. You can claim{' '}
              <span className="text-cyan-300 font-semibold">{displayAmount}</span> back to your wallet.
            </p>
          </div>

          <div className="border border-cyan-500/25 rounded-lg bg-cyan-500/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Amount to claim</p>
            <p className="text-gold-400 font-mono text-3xl md:text-4xl font-bold tabular-nums">{displayAmount}</p>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/25 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 text-lg shrink-0" aria-hidden>
                ℹ
              </span>
              <div className="text-gray-300 text-sm leading-relaxed">
                Claiming returns your locked stake for this canceled match. You only need to confirm once on-chain.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              className="flex-1 bg-gray-800/80 hover:bg-gray-700/90 text-white py-3 rounded-lg font-tech font-bold uppercase tracking-wider text-sm transition border border-gray-600/50"
              //   onClick={onClose}
              onClick={() => refetch()}
              disabled={isLoading || isClaiming}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="flex-1 btn-cyber py-3 rounded-lg font-tech font-bold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => void onClaim()}
              disabled={isLoading || isClaiming}
            >
              {isClaiming ? 'Claiming…' : 'Claim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogFighterReStake;
