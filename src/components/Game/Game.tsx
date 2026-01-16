import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import GameCanvas from './GameCanvas';
import FighterHUD from './FighterHUD';
import ViewerHUD from './ViewerHUD';
import GameOver from '../Screens/GameOver';
import ViewerResults from '../Screens/ViewerResults';

export default function Game() {
  const navigate = useNavigate();
  const { gameState } = useGame();

  useEffect(() => {
    if (gameState.screen !== 'GAME' && gameState.screen !== 'GAMEOVER') {
      navigate('/');
    }
  }, [gameState.screen, navigate]);

  if (gameState.screen === 'GAMEOVER') {
    const victory = gameState.time >= 180 || gameState.gameOver;
    if (gameState.role === 'FIGHTER') {
      return <GameOver victory={victory} />;
    } else {
      return <ViewerResults victory={victory} />;
    }
  }

  return (
    <div className="absolute inset-0">
      <GameCanvas />
      {gameState.role === 'FIGHTER' && <FighterHUD />}
      {gameState.role === 'VIEWER' && <ViewerHUD />}
      <div id="damage-overlay" className="absolute inset-0 pointer-events-none z-40 bg-radial-gradient from-red-600/30 to-transparent opacity-0 transition-opacity duration-300"></div>
      <div
        id="zone-warning-overlay"
        className={`absolute inset-0 pointer-events-none z-30 ${gameState.zoneDamageTicker > 0 ? 'zone-warning' : 'hidden'}`}
      ></div>
      {gameState.role === 'FIGHTER' && gameState.inputMode === 'MOUSE' && (
        <div id="reticle" className="absolute pointer-events-none z-100"></div>
      )}
    </div>
  );
}

