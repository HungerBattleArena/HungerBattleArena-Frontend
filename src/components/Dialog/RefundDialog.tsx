import { useSearchParams } from 'react-router-dom';
import useUserRefund from '../../hooks/mutation/viewer/useUserRefund';
import useMatchInfo from '../../hooks/query/useMatchInfo';

interface RefundDialogProps {
  isOpen: boolean;
  roomName: string | undefined;
  yourBet: number;
  yourSide: string | null;
  roomPool: string | undefined;
  onClose: () => void;
}

export default function RefundDialog({ isOpen, roomName, yourBet, yourSide, roomPool, onClose }: RefundDialogProps) {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');
  const { data: selectedRoom } = useMatchInfo(matchId || undefined);
  const { mutateAsync: refundBet } = useUserRefund();

  const handleRefund = async () => {
    await refundBet({ matchId: selectedRoom?.match_id || '', vaultId: selectedRoom?.vault_id || '' });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-100 bg-black/95">
      <div className="glass-panel w-full max-w-2xl p-8 relative fade-in">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition" onClick={onClose}>
          ×
        </button>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white mb-2">REFUND REQUEST</h2>
          <p className="text-gray-400">Retrieve your bet from the match</p>
        </div>

        <div className="border-t border-b border-gray-800 py-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 uppercase tracking-wide text-sm">Room Name</span>
            <span className="text-white font-bold text-lg">{roomName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 uppercase tracking-wide text-sm">Match ID</span>
            <span className="text-white font-mono text-sm">{matchId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 uppercase tracking-wide text-sm">Your Bet Side</span>
            <span className={`font-bold text-xl ${yourSide === 'WIN' ? 'text-cyan-400' : 'text-pink-400'}`}>
              {yourSide}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 uppercase tracking-wide text-sm">Your Bet Amount</span>
            <span className="text-gold-400 font-mono text-2xl font-bold">{yourBet.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 uppercase tracking-wide text-sm">Total Room Pool</span>
            <span className="text-white font-mono text-lg">{roomPool ? Number(roomPool).toLocaleString() : ''}</span>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div>
              <div className="text-yellow-400 font-bold mb-1">Refund Notice</div>
              <div className="text-gray-300 text-sm">
                Requesting a refund will return your bet amount. This action cannot be undone.
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold uppercase tracking-wider transition"
            onClick={onClose}
          >
            Cancel
          </button>
          {yourBet > 0 && (
            <button
              className="flex-1 btn-cyber py-3 rounded-lg font-bold uppercase tracking-wider"
              onClick={handleRefund}
            >
              Confirm Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
