import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import MainMenu from "./components/Screens/MainMenu";
import FighterRoom from "./components/Screens/FighterRoom";
import ViewerRooms from "./components/Screens/ViewerRooms";
import ViewerBet from "./components/Screens/ViewerBet";
import GameHost from "./components/Screens/GameHost";

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="relative w-screen h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/fighter-room" element={<FighterRoom />} />
            <Route path="/viewer-rooms" element={<ViewerRooms />} />
            <Route path="/viewer-bet" element={<ViewerBet />} />
            <Route path="/game" element={<GameHost />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
