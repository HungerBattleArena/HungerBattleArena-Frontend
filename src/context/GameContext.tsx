import React, { createContext, useContext, useState } from "react";
import type { GameState, Room, UserData } from "../types/game";
import { loadUserData, saveUserData } from "../utils/storage";

interface GameContextType {
  gameState: GameState;
  setGameState: (state: Partial<GameState>) => void;
  userData: UserData;
  setUserData: (data: UserData) => void;
  activeRooms: Room[];
  setActiveRooms: (rooms: Room[]) => void;
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
  fighterRoom: Room;
  setFighterRoom: (room: Room) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserDataState] = useState<UserData>(loadUserData());
  const [gameState, setGameStateState] = useState<GameState>({
    screen: "MENU",
    role: "FIGHTER",
    faction: null,
    time: 0,
    phase: 1,
    gameOver: false,
    inputMode: "MOUSE",
    userBetAmount: 0,
    viewerIP: 0,
    viewerCooldowns: {},
    arenaRadius: 800,
    zoneDamageTicker: 0,
  });

  const [activeRooms, setActiveRooms] = useState<Room[]>([
    {
      id: "ROOM-109",
      name: "Neon Ronin",
      totalBet: 12540,
      winBet: 7540,
      loseBet: 5000,
      winCount: 42,
      loseCount: 28,
      state: "OPEN",
    },
    {
      id: "ROOM-202",
      name: "Heavy Titan",
      totalBet: 45200,
      winBet: 38500,
      loseBet: 6700,
      winCount: 210,
      loseCount: 38,
      state: "OPEN",
    },
    {
      id: "ROOM-315",
      name: "Viper Sniper",
      totalBet: 8900,
      winBet: 1900,
      loseBet: 7000,
      winCount: 12,
      loseCount: 65,
      state: "CLOSED",
    },
    {
      id: "ROOM-404",
      name: "Cyber Monk",
      totalBet: 22100,
      winBet: 10900,
      loseBet: 11200,
      winCount: 95,
      loseCount: 98,
      state: "OPEN",
    },
    {
      id: "ROOM-555",
      name: "Tech Wizard",
      totalBet: 5000,
      winBet: 4200,
      loseBet: 800,
      winCount: 31,
      loseCount: 6,
      state: "OPEN",
    },
  ]);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [fighterRoom, setFighterRoom] = useState<Room>({
    id: "FIGHTER-ROOM",
    name: "Not opened",
    totalBet: 0,
    winBet: 0,
    loseBet: 0,
    winCount: 0,
    loseCount: 0,
    state: "CLOSED",
  });

  const setGameState = (updates: Partial<GameState>) => {
    setGameStateState((prev) => ({ ...prev, ...updates }));
  };

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    saveUserData(data);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        userData,
        setUserData,
        activeRooms,
        setActiveRooms,
        selectedRoom,
        setSelectedRoom,
        fighterRoom,
        setFighterRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}
