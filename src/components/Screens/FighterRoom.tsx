import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useOpenRoom from '../../hooks/mutation/match/useOpenRoom';
import useStartMatch from '../../hooks/mutation/match/useStartMatch';
import { setFighterRoom, setGameState } from '../../store/gameSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { cn } from '../../utils/utils';
import RoomInfo from '../Section/FighterRoom/RoomInfo';

export default function FighterRoom() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fighterRoom = useAppSelector((state) => state.game.fighterRoom);
  const { mutateAsync: openRoom } = useOpenRoom();
  const { mutateAsync: startMatch } = useStartMatch();
  const setFighterRoomAction = (room: Parameters<typeof setFighterRoom>[0]) => {
    dispatch(setFighterRoom(room));
  };
  const setGameStateAction = (updates: Parameters<typeof setGameState>[0]) => {
    dispatch(setGameState(updates));
  };
  const [roomName, setRoomName] = useState('');
  const [isOpenRoom, setIsOpenRoom] = useState(false);
  const [newRoomId, setNewRoomId] = useState('');

  const openFighterRoom = async () => {
    if (roomName.trim() === '') {
      toast.error('Room name is required');
      return;
    }

    try {
      const matchId = await openRoom({ roomName });

      if (!matchId || matchId === '') {
        throw new Error("Failed to open room" + matchId);
      }

      setNewRoomId(matchId);
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
    navigate(`/game?room=${newRoomId}`);
  };

  return (
    <div className="absolute inset-0 bg-black/90 pointer-events-auto z-50 flex items-center justify-center">
      <div className="glass-panel w-full max-w-5xl p-10 relative fade-in overflow-y-auto max-h-screen">
        <button className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-white z-50" onClick={() => navigate('/')}>
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

            <button className={cn('btn-cyber px-8 py-3 text-lg font-bold w-full', isOpenRoom && 'opacity-50 disabled:cursor-not-allowed')} onClick={openFighterRoom} disabled={isOpenRoom}>
              Open Room
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-3xl text-white mb-2">Room Status</h3>
              <p className="text-sm text-gray-400">Track bettors before starting.</p>
            </div>
            <RoomInfo />
            <button
              id="btn-start-match"
              className={cn('btn-cyber px-8 py-3 text-lg font-bold w-full', !isOpenRoom && 'opacity-50 disabled:cursor-not-allowed')}
              onClick={startMatchAsFighter}
              disabled={!isOpenRoom}
            >
              Start Match
            </button>
            <p className="text-xs text-gray-500">Start when you feel there are enough bettors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
