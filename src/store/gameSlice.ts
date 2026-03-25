import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GameState, TMatchInfo } from '../types/game';

interface GameSliceState {
  gameState: GameState;
  activeRooms: TMatchInfo[];
  selectedRoom: TMatchInfo | null;
  fighterRoom: TMatchInfo;
}

export const defaultFighterRoom: TMatchInfo = {
  match_id: '',
  fighter: '',
  name: '',
  status: 0,
  vault_id: null,
  result: null,
  total_bet_viewers: '0',
  total_pool: '0',
  win_bets_total: '0',
  lose_bets_total: '0',
  win_bettors_count: '0',
  lose_bettors_count: '0',
  cancel_stake_refundable: false,
};

const initialState: GameSliceState = {
  gameState: {
    screen: 'MENU',
    role: 'FIGHTER',
    faction: null,
    time: 0,
    phase: 1,
    gameOver: false,
    userBetAmount: 0,
  },
  activeRooms: [],
  selectedRoom: null,
  fighterRoom: defaultFighterRoom,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameState: (state, action: PayloadAction<Partial<GameState>>) => {
      state.gameState = { ...state.gameState, ...action.payload };
    },
    setActiveRooms: (state, action: PayloadAction<TMatchInfo[]>) => {
      state.activeRooms = action.payload;
    },
    setSelectedRoom: (state, action: PayloadAction<TMatchInfo | null>) => {
      state.selectedRoom = action.payload;
    },
    setFighterRoom: (state, action: PayloadAction<TMatchInfo>) => {
      state.fighterRoom = action.payload;
    },
    resetFighterRoom: (state) => {
      state.fighterRoom = defaultFighterRoom;
    },
  },
});

export const { setGameState, setActiveRooms, setSelectedRoom, setFighterRoom, resetFighterRoom } = gameSlice.actions;

export default gameSlice.reducer;
