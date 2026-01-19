import useMatchInfo from '../../../hooks/query/useMatchInfo';
import { useAppSelector } from '../../../store/hooks';

const RoomInfo = () => {
  const fighterRoom = useAppSelector((state) => state.game.fighterRoom);
  const isOpen = fighterRoom.status === 'OPEN';
  const { data: matchInfo } = useMatchInfo();

  return (
    <div className="glass-panel p-6 space-y-4 border border-gray-800">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">Room</div>
        <div className="text-lg text-white font-bold">{fighterRoom.name}</div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">Status</div>
        <div className={`status-pill ${isOpen ? 'open' : 'closed'}`}>{isOpen ? 'BETTING OPEN' : 'BETTING CLOSED'}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-black/40 p-3 rounded border border-gray-800">
          <div className="text-gray-500">Total bettors</div>
          <div className="text-xl text-white font-bold">{matchInfo?.total_bet_viewers.toLocaleString()}</div>
        </div>
        <div className="bg-black/40 p-3 rounded border border-gray-800">
          <div className="text-gray-500">Total bet</div>
          <div className="text-xl text-gold-400 font-bold">{matchInfo?.total_pool.toLocaleString()}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-black/40 p-3 rounded border border-cyan-500/30">
          <div className="text-cyan-400">WIN side</div>
          <div className="text-white font-bold">{matchInfo?.win_bets_total.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{matchInfo?.win_bettors_count.toLocaleString()} bettors</div>
        </div>
        <div className="bg-black/40 p-3 rounded border border-pink-500/30">
          <div className="text-pink-400">LOSE side</div>
          <div className="text-white font-bold">{matchInfo?.lose_bets_total.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{matchInfo?.lose_bettors_count.toLocaleString()} bettors</div>
        </div>
      </div>
    </div>
  );
};

export default RoomInfo;
