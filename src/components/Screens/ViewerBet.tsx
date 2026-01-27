import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setGameState } from '../../store/gameSlice';
import BetLockedDialog from '../Dialog/BetLockedDialog';
import usePlaceBet from '../../hooks/mutation/viewer/usePlaceBet';
import { toast } from 'react-toastify';
import useMatchInfo from '../../hooks/query/useMatchInfo';
import useGetUserBet from '../../hooks/query/useGetUserBet';
import RefundDialog from '../Dialog/RefundDialog';

export default function ViewerBet() {
  const [selectedBetSide, setSelectedBetSide] = useState<'WIN' | 'LOSE' | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [showBetLockedDialog, setShowBetLockedDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selectedRoom = useAppSelector((state) => state.game.selectedRoom);
  const { data, refetch } = useGetUserBet();
  const { mutateAsync: placeBet } = usePlaceBet();
  const { data: matchInfo, isFetched: isMatchInfoFetched } = useMatchInfo(selectedRoom?.match_id, 5000);

  const lockBetAndEnter = async () => {
    if (!selectedRoom) return null;
    if (selectedRoom.status === 'ended' || selectedRoom.status == 'in_game') {
      toast.warning('Betting is closed.');
      return;
    }
    if (!selectedBetSide) {
      toast.warning('Select WIN or LOSE.');
      return;
    }
    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      toast.warning('Enter a valid bet amount.');
      return;
    }

    try {
      await placeBet({
        vaultId: selectedRoom.vault_id!,
        side: selectedBetSide,
        amount: amount,
      });

      dispatch(
        setGameState({
          role: 'VIEWER',
          faction: selectedBetSide,
          userBetAmount: Number(amount),
        })
      );
      setSelectedBetSide(selectedBetSide);
      setShowBetLockedDialog(true);

      await refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to place bet');
    }
  };

  useEffect(() => {
    // NOTE: Auto-navigate after 2 seconds when game starts
    if (matchInfo?.status == 'in_game') {
      const timer = setTimeout(() => {
        navigate(`/view-game?room=${selectedRoom?.match_id}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchInfo?.status, isMatchInfoFetched]);


  useEffect(() => {
    if (matchInfo?.status == "cancelled") {
      setShowBetLockedDialog(false);
      setShowRefundDialog(true);
    }
  }, [matchInfo, isMatchInfoFetched]);

  if (!selectedRoom) {
    navigate('/viewer-rooms');
    return null;
  }

  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center overflow-y-auto pointer-events-auto z-50 bg-black/95 md:p-8">
        <div
          style={{ display: showBetLockedDialog || showRefundDialog ? 'none' : 'block' }}
          className="glass-panel w-full max-w-4xl p-4 md:p-10 relative fade-in my-auto"
        >
          <button
            className="text-white text-sm md:text-base z-50 hover:text-cyan-400 transition mb-4 md:mb-0"
            onClick={() => navigate('/viewer-rooms')}
          >
            ← Change room
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-4 md:pb-6 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{selectedRoom.name}</h2>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Lock your bet before the fighter starts.</p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-gray-500">Total bet</div>
              <div className="text-2xl sm:text-2xl md:text-3xl text-gold-400 font-mono">
                {selectedRoom.total_bet_viewers.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div
              className={`bet-side-card p-4 md:p-6 rounded-lg ${selectedBetSide === 'WIN' ? 'selected' : ''}`}
              onClick={() => setSelectedBetSide('WIN')}
            >
              <h3 className="text-2xl md:text-3xl text-cyan-400 font-bold">WIN</h3>
              <p className="text-xs md:text-sm text-gray-400 mt-2">Fighter survives</p>
              <div className="text-xs text-gray-500 mt-3 md:mt-4">Bet pool</div>
              <div className="text-lg md:text-xl text-white font-bold">
                {selectedRoom.win_bets_total.toLocaleString()}
              </div>
            </div>
            <div
              className={`bet-side-card p-4 md:p-6 rounded-lg ${selectedBetSide === 'LOSE' ? 'selected' : ''}`}
              onClick={() => setSelectedBetSide('LOSE')}
            >
              <h3 className="text-2xl md:text-3xl text-pink-400 font-bold">LOSE</h3>
              <p className="text-xs md:text-sm text-gray-400 mt-2">Fighter is eliminated</p>
              <div className="text-xs text-gray-500 mt-3 md:mt-4">Bet pool</div>
              <div className="text-lg md:text-xl text-white font-bold">
                {selectedRoom.lose_bets_total.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:gap-4 items-center">
            <input
              id="viewer-bet-amount"
              className="input-cyber w-full rounded text-sm md:text-base"
              placeholder="Enter bet amount"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
            />
            <button
              id="btn-lock-bet"
              className="btn-cyber px-8 md:px-10 py-3 text-base md:text-lg font-bold w-full md:w-auto text-nowrap"
              onClick={lockBetAndEnter}
            >
              Lock Bet
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500">Betting closes when the fighter starts the match.</div>
        </div>

        <RefundDialog
          isOpen={showRefundDialog}
          roomName={selectedRoom.name}
          yourBet={data?.amount || 0}
          yourSide={selectedBetSide}
          roomPool={matchInfo?.total_pool || '0'}
          onClose={() => {
            navigate('/viewer-rooms');
          }}
        />

        <BetLockedDialog
          isOpen={showBetLockedDialog}
          roomName={selectedRoom.name}
          yourSide={data?.side || selectedBetSide || 'NONE'}
          roomPool={Number(matchInfo?.total_pool)}
          winAmount={Number(matchInfo?.win_bets_total)}
          winBettors={Number(matchInfo?.win_bettors_count)}
          loseAmount={Number(matchInfo?.lose_bets_total)}
          loseBettors={Number(matchInfo?.lose_bettors_count)}
        />
      </div>
    </>
  );
}
