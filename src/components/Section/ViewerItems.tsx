import { LoseSideItems, WinSideItems } from "../../constants/item";
import { useAppSelector } from "../../store/hooks";

interface ViewerItemsProps {
  onSendMessageToGame: (msg: string) => void;
}

const ViewerItems = ({ onSendMessageToGame }: ViewerItemsProps) => {
  const gameState = useAppSelector((state) => state.game.gameState);
  const handleClickItem = (itemId: string) => {
    onSendMessageToGame(itemId);
  };

  const listItems = gameState.faction === 'WIN' ? WinSideItems : LoseSideItems;

  return (
    <div className="p-4 flex gap-3 w-full items-center justify-center">
      {listItems.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center gap-2 border border-white rounded-md p-2 bg-white/30 backdrop-blur-none w-30 cursor-pointer"
          onClick={() => handleClickItem(item.id)}
        >
          <img src={item.img} alt={item.name} className="w-10 h-10" />
          <span className="text-white">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ViewerItems;
