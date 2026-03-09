import { useState, useEffect, useCallback } from 'react';
import { LoseSideItems, WinSideItems } from '../../constants/item';
import { useAppSelector } from '../../store/hooks';

interface ViewerItemsProps {
  onSendMessageToGame: (msg: string) => void;
}

const ViewerItems = ({ onSendMessageToGame }: ViewerItemsProps) => {
  const gameState = useAppSelector((state) => state.game.gameState);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  const handleClickItem = useCallback(
    (itemId: string) => {
      if (isCooldown) return;

      onSendMessageToGame(itemId);
      setIsCooldown(true);
      setCooldownEndTime(Date.now() + 10000);
    },
    [isCooldown, onSendMessageToGame]
  );

  useEffect(() => {
    if (!cooldownEndTime) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setIsCooldown(false);
        setCooldownEndTime(null);
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  const listItems = gameState.faction === 'WIN' ? WinSideItems : LoseSideItems;

  return (
    <div className="p-4 flex gap-3 w-full items-center justify-center">
      {listItems.map((item) => (
        <div
          key={item.id}
          className={`flex flex-col items-center gap-2 border border-white rounded-md p-2 bg-white/30 backdrop-blur-none w-30 relative ${
            isCooldown ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => handleClickItem(item.id)}
        >
          <img src={item.img} alt={item.name} className="w-10 h-10" />
          <span className="text-white">{item.name}</span>
          {isCooldown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
              <span className="text-white text-2xl font-bold">{remainingTime}s</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ViewerItems;
