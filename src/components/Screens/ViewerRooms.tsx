import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { setSelectedRoom } from "../../store/gameSlice";

export default function ViewerRooms() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeRooms = useAppSelector((state) => state.game.activeRooms);
  const setSelectedRoomAction = (room: Parameters<typeof setSelectedRoom>[0]) => {
    dispatch(setSelectedRoom(room));
  };
  const [searchQuery, setSearchQuery] = useState("");

  const selectRoom = (room: (typeof activeRooms)[0]) => {
    if (room.state === "CLOSED") return;
    setSelectedRoomAction(room);
    navigate("/viewer-bet");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundRoom = activeRooms.find(
      (room) => room.id.toUpperCase() === searchQuery.trim().toUpperCase()
    );
    if (foundRoom) {
      selectRoom(foundRoom);
    }

    navigate("/view-game?room=" + searchQuery);
  };

  const filteredRooms = activeRooms.filter(
    (room) =>
      room.id.toUpperCase().includes(searchQuery.trim().toUpperCase()) ||
      room.name.toUpperCase().includes(searchQuery.trim().toUpperCase())
  );

  return (
    <div className="absolute inset-0 bg-black/95 pointer-events-auto z-50 flex flex-col items-center justify-center fade-in">
      <div className="w-full max-w-7xl px-8 mb-4 flex flex-col gap-4 border-b border-gray-800 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1
              className="text-4xl md:text-6xl font-black glitch-text text-white"
              data-text="VIEWER ROOMS"
            >
              VIEWER ROOMS
            </h1>
            <p className="text-gray-400 tracking-widest uppercase text-sm mt-2">
              Pick a room to lock your bet
            </p>
          </div>
        </div>

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

      <div className="w-full max-w-7xl h-[65vh] overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-2xl mb-2">No rooms found</div>
            <div className="text-sm">
              Try searching with a different Room ID or Name
            </div>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isClosed = room.state === "CLOSED";
            return (
              <div
                key={room.id}
                className={`room-card glass-panel p-6 flex flex-col gap-4 relative ${isClosed ? "disabled" : ""
                  }`}
                onClick={() => selectRoom(room)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs text-gray-500 font-mono">
                      {room.id}
                    </div>
                    <h3 className="text-2xl text-white font-bold">
                      {room.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">TOTAL BET</div>
                    <div className="text-gold-400 font-bold">
                      {room.totalBet.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-black/40 p-3 rounded border border-cyan-500/30">
                    <div className="text-cyan-400">WIN</div>
                    <div className="text-white font-bold">
                      {room.winBet.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {room.winCount} bettors
                    </div>
                  </div>
                  <div className="bg-black/40 p-3 rounded border border-pink-500/30">
                    <div className="text-pink-400">LOSE</div>
                    <div className="text-white font-bold">
                      {room.loseBet.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {room.loseCount} bettors
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
                  <div
                    className={`status-pill ${isClosed ? "closed" : "open"}`}
                  >
                    {isClosed ? "BETTING CLOSED" : "BETTING OPEN"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isClosed ? "CLOSED" : "OPEN"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        className="absolute top-6 left-6 text-xl text-gray-400 hover:text-white z-50 flex items-center gap-2 font-tech"
        onClick={() => navigate("/")}
      >
        <span>‹</span> RETURN TO MENU
      </button>
    </div>
  );
}
