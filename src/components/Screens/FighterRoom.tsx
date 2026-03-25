import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InfoIcon from '../../assets/info';
import useCancelMatch from '../../hooks/mutation/match/useCancelMatch';
import useFighterCancel from '../../hooks/mutation/match/useFighterCancel';
import useOpenRoom from '../../hooks/mutation/match/useOpenRoom';
import useStartMatch from '../../hooks/mutation/match/useStartMatch';
import { API_END_POINTS } from '../../services/api';
import { API_URL } from '../../services/constant';
import { resetFighterRoom, setFighterRoom, setGameState } from '../../store/gameSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { cn } from '../../utils/utils';
import DialogFighterReStake from '../Dialog/DialogFighterReStake';
import RoomInfo from '../Section/FighterRoom/RoomInfo';

export default function FighterRoom() {
  const [roomName, setRoomName] = useState('');
  const [isOpenRoom, setIsOpenRoom] = useState(false);
  const [matchId, setMatchId] = useState('');
  const [isOpenRestake, setIsOpenRestake] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mutateAsync: openRoom } = useOpenRoom();
  const { mutateAsync: startMatch } = useStartMatch();
  const { mutate: cancelMatch } = useCancelMatch();
  const { mutateAsync: cancelAsFighter, isPending: isCanceling } = useFighterCancel();
  const fighterRoom = useAppSelector((state) => {
    return state.game.fighterRoom;
  });

  const isCanStartMatch = Number(fighterRoom.lose_bettors_count) > 1 && Number(fighterRoom.win_bettors_count) > 1;

  const setFighterRoomAction = (room: Parameters<typeof setFighterRoom>[0]) => {
    dispatch(setFighterRoom(room));
  };
  const setGameStateAction = (updates: Parameters<typeof setGameState>[0]) => {
    dispatch(setGameState(updates));
  };

  const openFighterRoom = async () => {
    if (roomName.trim() === '') {
      toast.error('Room name is required');
      return;
    }

    try {
      const matchId = await openRoom({ roomName });

      if (!matchId || matchId === '') {
        throw new Error('Failed to open room' + matchId);
      }

      setMatchId(matchId);
      setIsOpenRoom(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to open room');
    }
  };

  const startMatchAsFighter = async () => {
    setFighterRoomAction({ ...fighterRoom, status: 'ended' });
    setGameStateAction({ role: 'FIGHTER' });
    await startMatch();
    navigate(`/game?room=${matchId}`);
  };

  const cancelMatchAsFighter = async () => {
    try {
      await cancelAsFighter({ matchId: fighterRoom.match_id });
      setIsOpenRestake(true);
      dispatch(resetFighterRoom());
    } catch {
      setIsOpenRestake(false);
    }
  };

  useEffect(() => {
    if (!isOpenRoom || !matchId) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };

    const handlePageHide = (e: PageTransitionEvent) => {
      // This fires when the page is actually being unloaded (user confirmed)
      if (e.persisted === false && matchId) {
        const url = `${API_URL}${API_END_POINTS.cancelMatch}`;
        const data = JSON.stringify({ matchId: matchId });

        // Try fetch with keepalive first (supports headers, works during unload)
        fetch(url, {
          method: 'POST',
          body: data,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {
          // If fetch fails, try sendBeacon as fallback (guaranteed to send)
          const blob = new Blob([data], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        });

        // Also try the mutation (may not complete during unload but worth trying)
        cancelMatch({ matchId: matchId });
      }
    };

    const handlePopState = () => {
      if (isOpenRoom && matchId) {
        const confirmLeave = window.confirm('You have an open room. Are you sure you want to leave?');
        if (confirmLeave) {
          cancelMatch({ matchId: matchId });
        } else {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // Push a state to enable popstate detection
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenRoom, matchId]);

  return (
    <div className="absolute inset-0 bg-black/90 pointer-events-auto z-50 flex items-center justify-center">
      <div className="glass-panel w-full max-w-5xl p-10 relative fade-in overflow-y-auto max-h-screen">
        <button
          className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-white z-50"
          onClick={() => {
            if (matchId) {
              cancelMatch({ matchId: matchId });
            }
            navigate('/');
          }}
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl text-cyan-400 mb-2">Create Room</h3>
              <p className="text-sm text-gray-400">Name your room and open betting.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500">Room name</label>
              <input
                id="fighter-room-name"
                className="input-cyber w-full rounded"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>

            <div className="bg-black/40 border border-gray-800 rounded p-4 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Default Fighter</span>
                <span className="text-white">Neon Ronin</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Default Weapon</span>
                <span className="text-white">Combat Knife</span>
              </div>
            </div>

            <button
              className={cn(
                'btn-cyber px-8 py-3 text-lg font-bold w-full',
                isOpenRoom && 'opacity-50 disabled:cursor-not-allowed'
              )}
              onClick={openFighterRoom}
              disabled={isOpenRoom}
            >
              Open Room
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-3xl text-white mb-2">Room Status</h3>
              <p className="text-sm text-gray-400">Track bettors before starting.</p>
            </div>
            <RoomInfo matchId={matchId} />
            <div className="flex gap-2">
              <button
                id="btn-start-match"
                className={cn(
                  'btn-cyber px-8 py-3 text-lg font-bold w-full',
                  !isOpenRoom && 'opacity-50 disabled:cursor-not-allowed'
                )}
                onClick={startMatchAsFighter}
                disabled={!isOpenRoom || !isCanStartMatch}
              >
                Start Match
              </button>
              <button
                id="btn-cancel-match"
                className={cn(
                  'btn-cyber px-8 py-3 text-lg font-bold w-full',
                  !isOpenRoom && 'opacity-50 disabled:cursor-not-allowed'
                )}
                onClick={cancelMatchAsFighter}
                disabled={!isOpenRoom || fighterRoom.cancel_stake_refundable}
              >
                Cancel Match
              </button>
            </div>
            <p className="text-xs text-red-300 mt-[-10px] flex gap-1.5">
              <InfoIcon />
              Canceling the match if both sides have bet will result in losing the stake; if not both sides have bet,
              the stake will be refunded.
            </p>
          </div>
        </div>
      </div>

      <DialogFighterReStake isOpen={isOpenRestake} isLoading={isCanceling} onClose={() => setIsOpenRestake(false)} />
    </div>
  );
}
