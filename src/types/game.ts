export interface Vector {
  x: number;
  y: number;
}

export interface Weapon {
  name: string;
  tier: number;
  type: 'melee' | 'projectile' | 'spread' | 'ray';
  damage: number;
  rate: number;
  range?: number;
  speed?: number;
  color: string;
  ammo: number;
  reload?: number;
  price?: number;
  count?: number;
  spread?: number;
  width?: number;
  icon?: string;
}

export interface Mob {
  name: string;
  hp: number;
  speed: number;
  damage: number;
  color: string;
  radius: number;
  score: number;
  type: 'melee' | 'ranged' | 'tank';
  range?: number;
}

export interface ViewerCard {
  id: string;
  name: string;
  cost: number;
  cooldown: number;
  icon: string;
  color: string;
  desc: string;
}

export interface Room {
  id: string;
  name: string;
  totalBet: number;
  winBet: number;
  loseBet: number;
  winCount: number;
  loseCount: number;
  state: 'OPEN' | 'CLOSED';
}

export interface UserData {
  credits: number;
  inventory: string[];
  skipInstructions: boolean;
}

export interface GameState {
  screen: 'MENU' | 'GAME' | 'GAMEOVER';
  role: 'FIGHTER' | 'VIEWER';
  faction: 'WIN' | 'LOSE' | null;
  time: number;
  phase: number;
  gameOver: boolean;
  inputMode: 'MOUSE' | 'KEYBOARD';
  userBetAmount: number;
  viewerIP: number;
  viewerCooldowns: Record<string, number>;
  arenaRadius: number;
  zoneDamageTicker: number;
}