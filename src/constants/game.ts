import type { Weapon, Mob, ViewerCard } from '../types/game';

export const CONFIG = {
  canvasId: 'gameCanvas',
  targetFPS: 60,
  hexSize: 40,
  matchDuration: 180, // 3 Minutes to survive
  minArenaRadius: 150,
  initialArenaRadius: 800,
  colors: {
    bg: '#050510',
    grid: '#1a1a2e',
    gridHighlight: '#00f3ff',
    gridDanger: '#ff0055',
    player: '#ffffff',
    enemy: '#ff0055',
    text: '#ffffff'
  }
};

export const WEAPONS: Record<string, Weapon> = {
  fists: { name: "Fists", tier: 0, type: 'melee', damage: 5, rate: 0.4, range: 40, color: '#aaaaaa', ammo: -1 },
  knife: { name: "Combat Knife", tier: 1, type: 'melee', damage: 15, rate: 0.3, range: 60, color: '#ffffff', ammo: -1 },
  pistol: { name: "Pistol", tier: 1, type: 'projectile', damage: 12, rate: 0.4, speed: 15, color: '#ffd700', ammo: 12, reload: 1.5 },
  bow: { name: "Auto-Bow", tier: 1, type: 'projectile', damage: 8, rate: 0.2, speed: 18, color: '#00ff00', ammo: 30, reload: 2.0 },
  shotgun: { name: "Scatter Shotgun", tier: 2, type: 'spread', damage: 8, count: 5, spread: 0.5, rate: 1.0, speed: 14, color: '#ff8800', ammo: 6, reload: 2.5, price: 2000 },
  pulseblade: { name: "Pulse Blade", tier: 2, type: 'melee', damage: 35, rate: 0.5, range: 90, color: '#00f3ff', ammo: -1, price: 2500 },
  railgun: { name: "Railgun Sniper", tier: 3, type: 'ray', damage: 100, rate: 2.0, range: 1000, color: '#ffffff', width: 4, ammo: 3, reload: 3.0, price: 5000 },
  plasma: { name: "Plasma Greatsword", tier: 3, type: 'melee', damage: 80, rate: 1.2, range: 120, color: '#ff0055', ammo: -1, price: 4500 }
};

export const MOBS: Record<string, Mob> = {
  goblin: { name: "Goblin Runner", hp: 30, speed: 3.5, damage: 15, color: '#00ff00', radius: 10, score: 10, type: 'melee' },
  spider: { name: "Nano-Spider", hp: 45, speed: 2.5, damage: 20, color: '#aa00ff', radius: 12, score: 15, type: 'melee' },
  ogre: { name: "Iron Ogre", hp: 200, speed: 1.2, damage: 35, color: '#ff4400', radius: 25, score: 50, type: 'tank' },
  archer: { name: "Plasma Archer", hp: 40, speed: 1.8, damage: 12, color: '#ffff00', radius: 14, score: 30, type: 'ranged', range: 300 }
};

export const ITEMS = {
  medkit: { name: "Medi-Stim", color: '#00ff00', type: 'consumable' }
};

export const VIEWER_CARDS: Record<'WIN' | 'LOSE', ViewerCard[]> = {
  WIN: [
    { id: 'drop_medkit', name: 'Medi-Pod', cost: 150, cooldown: 15, icon: '✚', color: 'text-green-400', desc: 'Heals 30 HP' },
    { id: 'buff_speed', name: 'Adrenaline', cost: 100, cooldown: 10, icon: '⏩', color: 'text-yellow-400', desc: '+50% Speed (10s)' },
    { id: 'drop_weapon', name: 'Weapon Drop', cost: 300, cooldown: 30, icon: '⚔️', color: 'text-cyan-400', desc: 'Random Tier 2+' },
    { id: 'buff_invuln', name: 'Nano-Shield', cost: 500, cooldown: 60, icon: '🛡️', color: 'text-purple-400', desc: 'Invincible (5s)' }
  ],
  LOSE: [
    { id: 'spawn_horde', name: 'Goblin Horde', cost: 150, cooldown: 20, icon: '👺', color: 'text-green-600', desc: 'Spawns 3 Goblins' },
    { id: 'spawn_sniper', name: 'Viper Unit', cost: 250, cooldown: 25, icon: '🏹', color: 'text-yellow-600', desc: 'Spawns Sniper' },
    { id: 'env_strike', name: 'Orbital Strike', cost: 400, cooldown: 45, icon: '🔥', color: 'text-red-500', desc: 'Area Damage' },
    { id: 'env_shrink', name: 'Zone Constrict', cost: 600, cooldown: 90, icon: '⭕', color: 'text-orange-500', desc: 'Shrinks Arena' }
  ]
};

export const CHAT_NAMES = ["Neo_X", "Glitch01", "Viper", "CyberPunk99", "BetLord", "RogueAI", "HexMaster"];
export const CHAT_MSGS = ["Looooool", "RIP", "Drop the hammer!", "Hold the line!", "What a play!", "GG", "Scammed", "Buy low sell high", "Doomers rising!"];

