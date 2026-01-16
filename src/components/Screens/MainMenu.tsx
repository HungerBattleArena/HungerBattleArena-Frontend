import { useNavigate } from "react-router-dom";

export default function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl pointer-events-auto z-50 fade-in">
      <h1
        className="text-7xl md:text-9xl font-black mb-4 glitch-text text-center"
        data-text="HUNGER BATTLE"
      >
        HUNGER BATTLE
      </h1>
      <h2 className="text-2xl md:text-3xl text-gray-300 tracking-[0.6em] mb-14 uppercase">
        Arena Prototype
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl w-full px-6">
        <div
          className="glass-panel p-8 flex flex-col items-center relative mode-card cursor-pointer"
          onClick={() => navigate("/fighter-room")}
        >
          <div className="text-6xl mb-4">F</div>
          <h3 className="text-3xl text-cyan-400">Fighter</h3>
          <p className="text-sm text-gray-400 mt-2">Solo Survival Room</p>
        </div>

        <div
          className="glass-panel p-8 flex flex-col items-center relative mode-card cursor-pointer"
          onClick={() => navigate("/viewer-rooms")}
        >
          <div className="text-6xl mb-4">V</div>
          <h3 className="text-3xl text-pink-500">Viewer Mode</h3>
          <p className="text-sm text-gray-400 mt-2">Bet on Win / Lose</p>
        </div>
      </div>

      <div className="mt-14 text-xs uppercase tracking-[0.4em] text-gray-500">
        Solo survival + betting flow
      </div>
    </div>
  );
}
