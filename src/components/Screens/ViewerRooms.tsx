import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setSelectedRoom } from '../../store/gameSlice';
import useListMatchInfo from '../../hooks/query/useListMatchInfo';
import usePagination from '../../hooks/usePagination';

export default function ViewerRooms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: activeRooms, isLoading } = useListMatchInfo();
  // ...existing code...
  const filteredRooms =
    activeRooms?.filter((room) => {
      if (!room?.match_id || !room?.name) return false;
      if (debouncedSearchQuery.trim() === '' || !debouncedSearchQuery) return true;
      return (
        room.match_id.toUpperCase().includes(debouncedSearchQuery.trim().toUpperCase()) ||
        room.name.toUpperCase().includes(debouncedSearchQuery.trim().toUpperCase())
      );
    }) || [];
  // ...existing code...

  const { data: paginatedRooms, currentPage, maxPage, next, prev } = usePagination(filteredRooms, { itemPerPage: 6 });
  console.log('🚀 ~ debouncedSearchQuery:', debouncedSearchQuery);
  console.log('🚀 ~ debouncedSearchQuery length:', debouncedSearchQuery.length);
  console.log('🚀 ~ searchQuery:', searchQuery);
  console.log('🚀 ~ activeRooms:', activeRooms);
  console.log('🚀 ~ activeRooms[0]:', activeRooms[0]);
  console.log('🚀 ~ filteredRooms:', filteredRooms);
  console.log('🚀 ~ paginatedRooms:', paginatedRooms);

  const setSelectedRoomAction = (room: Parameters<typeof setSelectedRoom>[0]) => {
    dispatch(setSelectedRoom(room));
  };

  const selectRoom = (room: (typeof activeRooms)[0]) => {
    if (room.status === 'ended' || room.status === 'in_game') return;
    setSelectedRoomAction(room);
    navigate(`/viewer-bet?room=${room.match_id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTerm = searchQuery.trim().toLowerCase();
    const foundRoom = activeRooms.find((room) => room.match_id.toLowerCase() === searchTerm || room.name.toLowerCase() === searchTerm);

    if (foundRoom) {
      selectRoom(foundRoom);
      return;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="bg-black/95 pointer-events-auto flex flex-col min-h-screen items-center fade-in pt-2">
      <div className="w-full max-w-7xl px-8 mb-4 flex flex-col gap-4 border-b border-gray-800">
        <button
          className="self-start text-xl text-gray-400 hover:text-white flex items-center gap-2 font-tech"
          onClick={() => navigate('/')}
        >
          <span>‹</span> RETURN TO MENU
        </button>
        {/* center the header */}
        <div className="flex justify-center items-end">
          <div>
            <h1 className="text-4xl md:text-6xl font-black glitch-text text-white text-center" data-text="VIEWER ROOMS">
              VIEWER ROOMS
            </h1>
          </div>
        </div>
        <p className="text-gray-400 tracking-widest uppercase text-sm">Pick a room to lock your bet</p>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Room ID or Name..."
            className="w-full bg-black/60 border border-cyan-500/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded border border-cyan-500/50 hover:border-cyan-500 transition-all text-sm font-bold uppercase tracking-wider"
          >
            JOIN
          </button>
        </form>
      </div>
      {/* {isLoading || isFetching && (
        <div className="w-full max-w-7xl p-4 flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-pulse"></div>
          </div>
          <div className="mt-6 text-cyan-400 font-bold uppercase tracking-wider animate-pulse">Loading Rooms...</div>
        </div>
      )} */}

      {isLoading ? (
        <div className="w-full max-w-7xl p-4 flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-pulse"></div>
          </div>
          <div className="mt-6 text-cyan-400 font-bold uppercase tracking-wider animate-pulse">Loading Rooms...</div>
        </div>
      ) : (
        <>
          <div className="w-full max-w-7xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="text-2xl mb-2">No rooms found</div>
                <div className="text-sm">Try searching with a different Room ID or Name</div>
              </div>
            ) : (
              paginatedRooms.map((room) => {
                const isEnded = room.status === 'ended';
                const isInGame = room.status === 'in_game';

                return (
                  <div
                    key={room.match_id}
                    className={`room-card glass-panel p-2 flex flex-col gap-4 relative transition-transform ${isEnded ? 'opacity-50 cursor-not-allowed' : isInGame ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                      }`}
                    onClick={() => selectRoom(room)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl text-white font-bold">{room.name}</h3>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">TOTAL BET</div>
                        <div className="text-gold-400 font-bold">{room.total_bet_viewers.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-black/40 p-3 rounded border border-cyan-500/30">
                        <div className="text-cyan-400">WIN</div>
                        <div className="text-white font-bold">{room.win_bets_total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{room.win_bettors_count} bettors</div>
                      </div>
                      <div className="bg-black/40 p-3 rounded border border-pink-500/30">
                        <div className="text-pink-400">LOSE</div>
                        <div className="text-white font-bold">{room.lose_bets_total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{room.lose_bettors_count} bettors</div>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
                      <div className={`status-pill ${room.status === 'created' ? 'open' : 'closed'}`}>
                        {room.status === 'created' ? 'BETTING OPEN' : 'BETTING CLOSED'}
                      </div>
                      <div
                        className={`text-xs font-semibold ${room.status === 'created' ? 'text-green-400' : room.status === 'in_game' ? 'text-yellow-400' : 'text-red-400'
                          }`}
                      >
                        {room.status === 'created' ? 'OPEN' : room.status === 'in_game' ? 'IN GAME' : 'ENDED'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {filteredRooms.length > 0 && maxPage > 1 && (
            <div className="w-full max-w-7xl px-8 py-4 flex justify-center items-center gap-4">
              <button
                onClick={prev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded border border-cyan-500/50 hover:border-cyan-500 transition-all text-sm font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹ PREV
              </button>
              <div className="text-white font-mono">
                Page {currentPage} of {maxPage}
              </div>
              <button
                onClick={next}
                disabled={currentPage === maxPage}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded border border-cyan-500/50 hover:border-cyan-500 transition-all text-sm font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
              >
                NEXT ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
