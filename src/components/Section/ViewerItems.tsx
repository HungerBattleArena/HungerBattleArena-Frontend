import { itemList } from "../../constants/item";

interface ViewerItemsProps {
  onSendMessageToGame: (msg: string) => void;
}

const ViewerItems = ({ onSendMessageToGame }: ViewerItemsProps) => {
  const handleClickItem = (itemId: string) => {
    onSendMessageToGame(itemId);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-3 w-full items-center justify-center">
      {itemList.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center gap-2 border border-white rounded-md p-2 bg-white/30 backdrop-blur-none w-28 cursor-pointer"
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
