import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CONFIG } from '../../constants/game';

export default function FighterHUD() {
  const { gameState } = useGame();
  const [hintsVisible, setHintsVisible] = useState(true);
  const [hp, setHp] = useState(100);
  const [armor, setArmor] = useState(50);
  const [weapon, setWeapon] = useState('Combat Knife');
  const [ammo, setAmmo] = useState('∞');

  useEffect(() => {
    if (gameState.role === 'FIGHTER') {
      const timer = setTimeout(() => setHintsVisible(false), 12000);
      return () => clearTimeout(timer);
    }
  }, [gameState.role]);

  // Update from game state (would be connected to game engine)
  useEffect(() => {
    // This would be updated by the game engine
    const interval = setInterval(() => {
      // Placeholder - actual values would come from game engine
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const timeLeft = Math.max(0, CONFIG.matchDuration - gameState.time);
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  let phaseText = "Phase 1: Warm Up";
  if (timeLeft <= 60) phaseText = "Phase 3: SUDDEN DEATH";
  else if (timeLeft <= 120) phaseText = "Phase 2: Constriction";

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Top Info */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="text-3xl font-tech text-white drop-shadow-md">{timeStr}</div>
        <div className="text-xs text-gray-400 tracking-widest uppercase">{phaseText}</div>
      </div>

      {/* Contextual Hints */}
      {hintsVisible && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hint-overlay">
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded border border-cyan-500/30">
            <span className="key-icon text-xs h-6 min-w-[24px]">W</span>
            <span className="key-icon text-xs h-6 min-w-[24px]">A</span>
            <span className="key-icon text-xs h-6 min-w-[24px]">S</span>
            <span className="key-icon text-xs h-6 min-w-[24px]">D</span>
            <span className="text-cyan-400 text-sm font-bold ml-2">MOVE</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded border border-pink-500/30">
            <span className="key-icon text-xs h-6 min-w-[24px]">↑</span>
            <span className="key-icon text-xs h-6 min-w-[24px]">↓</span>
            <span className="key-icon text-xs h-6 min-w-[24px]">←</span>
            <span className="key-icon text-xs h-6 min-w-[24px]">→</span>
            <span className="text-pink-400 text-sm font-bold ml-2">AIM</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded border border-gold-500/30">
            <span className="key-icon text-xs h-6 px-2">SPACE</span>
            <span className="text-white text-xs font-bold px-1">OR</span>
            <span className="key-icon text-xs h-6 px-2">CLICK</span>
            <span className="text-yellow-400 text-sm font-bold ml-2">ATTACK</span>
          </div>
        </div>
      )}

      {/* Health & Ammo (Bottom Left) */}
      <div className="absolute bottom-8 left-8">
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-white">{Math.floor(hp)}</span>
          <span className="text-sm text-gray-400 mb-1">HP</span>
        </div>
        <div className="w-64 h-3 bg-gray-800 skew-x-[-12deg] border border-gray-600">
          <div
            className="w-full h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
            style={{ width: `${Math.max(0, hp)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-48 h-2 bg-gray-800 skew-x-[-12deg] border border-gray-600">
            <div
              className="w-1/2 h-full bg-cyan-400 transition-all duration-200"
              style={{ width: `${Math.max(0, armor)}%` }}
            />
          </div>
          <span className="text-xs text-cyan-400">SHIELD</span>
        </div>
      </div>

      {/* Weapon Info (Bottom Right) */}
      <div className="absolute bottom-8 right-8 text-right">
        <h3 className="text-2xl font-tech text-yellow-400 uppercase">{weapon}</h3>
        <p className="text-sm text-gray-400">{ammo}</p>
      </div>

      {/* Drop Prompt */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 uppercase tracking-widest bg-black/50 px-2 py-1 rounded">
        [G] DROP CURRENT WEAPON
      </div>
    </div>
  );
}

