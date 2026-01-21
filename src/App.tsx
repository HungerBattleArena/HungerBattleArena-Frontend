import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import MainMenu from "./components/Screens/MainMenu";
import FighterRoom from "./components/Screens/FighterRoom";
import ViewerRooms from "./components/Screens/ViewerRooms";
import ViewerBet from "./components/Screens/ViewerBet";
import GameHost from "./components/Screens/GameHost";
import ViewGame from "./components/Screens/ViewGame";
import { ToastNotifier } from "./components/Provider/ToastProvider";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  testnet: { url: "https://rpc-testnet.onelabs.cc:443" },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect={true}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <BrowserRouter>
                <div className="relative w-screen h-screen overflow-hidden">
                  <Routes>
                    <Route path="/" element={<MainMenu />} />
                    <Route path="/fighter-room" element={<FighterRoom />} />
                    <Route path="/viewer-rooms" element={<ViewerRooms />} />
                    <Route path="/viewer-bet" element={<ViewerBet />} />
                    <Route path="/view-game" element={<ViewGame />} />
                    <Route path="/game" element={<GameHost />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </PersistGate>
          </Provider>
          <ToastNotifier />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
