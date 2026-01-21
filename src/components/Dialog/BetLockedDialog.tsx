import useGetUserBet from '../../hooks/query/useGetUserBet';

interface BetLockedDialogProps {
  isOpen: boolean;
  roomName: string;
  yourSide: 'WIN' | 'LOSE';
  roomPool: number;
  winAmount: number;
  winBettors: number;
  loseAmount: number;
  loseBettors: number;
}

const BetLockedDialog: React.FC<BetLockedDialogProps> = ({
  isOpen,
  roomName,
  yourSide,
  roomPool,
  winAmount,
  winBettors,
  loseAmount,
  loseBettors,
}) => {
  const { data } = useGetUserBet();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto z-50 flex items-center justify-center fade-in">
      <div className="glass-panel w-full max-w-5xl p-10 relative fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-5xl font-black text-white mb-2 font-tech" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}>
              BET LOCKED
            </h2>
            <div className="flex items-center justify-end gap-4 mb-8">
              <span className="text-gray-400 text-sm uppercase tracking-wider">ROOM</span>
              <div className="flex items-center gap-3">
                <span className="text-white text-2xl font-bold">{roomName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-gray-400 text-lg">Waiting for the fighter to start the match.</p>
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700" style={{ borderTopColor: 'transparent' }}></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
                style={{
                  borderTopColor: '#06b6d4',
                  borderRightColor: '#06b6d4',
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Bet Section */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">YOUR BET</h3>

            <div className="flex items-start justify-between">
              <div className="text-5xl font-black text-white">{data?.amount}</div>
              <div className="text-right">
                <span className="text-gray-400 text-sm">Side: </span>
                <span className={`text-lg font-bold ${yourSide === 'WIN' ? 'text-cyan-400' : 'text-pink-400'}`}>{yourSide}</span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Status</p>
              <div className="inline-block">
                <div
                  className="px-4 py-2 rounded-full border-2 border-green-500 text-green-500 text-sm font-bold uppercase tracking-wider"
                  style={{
                    boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  BETTING OPEN
                </div>
              </div>
            </div>
          </div>

          {/* Room Pool Section */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">ROOM POOL</h3>

            <div className="text-5xl font-black text-white mb-6">{roomPool.toLocaleString()}</div>

            <div className="grid grid-cols-2 gap-4">
              {/* WIN Side */}
              <div className="border border-cyan-500/30 rounded-lg p-4 bg-cyan-500/5">
                <h4 className="text-cyan-400 text-xl font-bold mb-2" style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }}>
                  WIN
                </h4>
                <div className="text-white text-2xl font-bold mb-1">{winAmount.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">{winBettors} bettors</div>
              </div>

              {/* LOSE Side */}
              <div className="border border-pink-500/30 rounded-lg p-4 bg-pink-500/5">
                <h4 className="text-pink-400 text-xl font-bold mb-2" style={{ textShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}>
                  LOSE
                </h4>
                <div className="text-white text-2xl font-bold mb-1">{loseAmount.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">{loseBettors} bettors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetLockedDialog;
