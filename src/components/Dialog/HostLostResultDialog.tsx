import React, { useCallback, useEffect } from 'react'
import useEndMatch from '../../hooks/mutation/match/useEndMatch';

interface HostLostResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerName?: string;
}

const HostLostResultDialog: React.FC<HostLostResultDialogProps> = ({
  isOpen,
  onClose,
  playerName
}) => {
  const { mutateAsync: endMatch } = useEndMatch();

  const handleEndMatch = useCallback(async () => {
    await endMatch({ isWin: false });
  }, [endMatch]);

  useEffect(() => {
    if (isOpen) {
      handleEndMatch();
    }
  }, [handleEndMatch, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto z-50 flex items-center justify-center fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg p-10 relative fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-white transition-colors z-50"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">💀</div>

          <h2
            className="text-4xl font-black text-red-500 mb-2 font-tech"
            style={{ textShadow: '0 0 20px rgba(255, 0, 85, 0.8)' }}
          >
            PLAYER ELIMINATED
          </h2>

          {playerName && (
            <p className="text-xl text-gray-300 mb-4">
              <span className="text-cyan-400 font-bold">{playerName}</span> has been eliminated
            </p>
          )}

          <div className="h-px bg-linear-to-r from-transparent via-gray-600 to-transparent my-6"></div>

          <p className="text-gray-400 text-sm">
            The battle continues...
          </p>

          <button
            className="btn-cyber px-8 py-3 text-lg font-bold mt-6"
            onClick={onClose}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default HostLostResultDialog