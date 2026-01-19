import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { GameState, Room } from "../types/game";

interface GameSliceState {
  gameState: GameState;
  activeRooms: Room[];
  selectedRoom: Room | null;
  fighterRoom: Room;
}

const initialState: GameSliceState = {
  gameState: {
    screen: "MENU",
    role: "FIGHTER",
    faction: null,
    time: 0,
    phase: 1,
    gameOver: false,
    userBetAmount: 0,
  },
  activeRooms: [],
  selectedRoom: null,
  fighterRoom: {
    id: "FIGHTER-ROOM",
    name: "Not opened",
    totalBet: 0,
    winBet: 0,
    loseBet: 0,
    winCount: 0,
    loseCount: 0,
    state: "CLOSED",
    matchId: null,
  },
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameState: (state, action: PayloadAction<Partial<GameState>>) => {
      state.gameState = { ...state.gameState, ...action.payload };
    },
    setActiveRooms: (state, action: PayloadAction<Room[]>) => {
      state.activeRooms = action.payload;
    },
    setSelectedRoom: (state, action: PayloadAction<Room | null>) => {
      state.selectedRoom = action.payload;
    },
    setFighterRoom: (state, action: PayloadAction<Room>) => {
      state.fighterRoom = action.payload;
    },
  },
});

export const { setGameState, setActiveRooms, setSelectedRoom, setFighterRoom } =
  gameSlice.actions;

export default gameSlice.reducer;

