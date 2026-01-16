import { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { GameEngine } from '../../game/GameEngine';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameState, setGameState } = useGame();

  useEffect(() => {
    if (!canvasRef.current || gameState.screen !== 'GAME') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const engine = new GameEngine(canvas, ctx, gameState, setGameState);
    engineRef.current = engine;
    engine.start();

    return () => {
      window.removeEventListener('resize', resize);
      engine.cleanup();
    };
  }, [gameState.screen, setGameState]);

  return (
    <div id="game-container" className="absolute inset-0">
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        className="absolute inset-0"
      />
    </div>
  );
}

