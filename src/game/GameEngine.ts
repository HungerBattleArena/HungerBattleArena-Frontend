import { CONFIG, WEAPONS, MOBS, ITEMS, VIEWER_CARDS } from '../constants/game';
import type { GameState } from '../types/game';
import { Vector2D, lerp, getAngleDiff } from '../utils/vector';

// Game Entities
class Player {
  pos: Vector2D;
  vel: Vector2D;
  hp: number;
  maxHp: number;
  armor: number;
  speed: number;
  radius: number;
  angle: number;
  weaponKey: string;
  weapon: typeof WEAPONS[string];
  ammo: number;
  cooldown: number;
  reloadTimer: number;
  invuln: number;
  speedBuffTimer: number;

  constructor(loadoutWeaponKey: string) {
    this.pos = new Vector2D(0, 0);
    this.vel = new Vector2D(0, 0);
    this.hp = 100;
    this.maxHp = 100;
    this.armor = 50;
    this.speed = 4;
    this.radius = 15;
    this.angle = 0;
    this.weaponKey = loadoutWeaponKey;
    this.weapon = { ...WEAPONS[loadoutWeaponKey] };
    this.ammo = this.weapon.ammo;
    this.cooldown = 0;
    this.reloadTimer = 0;
    this.invuln = 0;
    this.speedBuffTimer = 0;
  }

  update(dt: number, keys: Record<string, boolean>, mouse: any, inputMode: string) {
    if (this.speedBuffTimer > 0) this.speedBuffTimer -= dt;

    let inputDir = new Vector2D(0, 0);
    if (keys['w']) inputDir.y -= 1;
    if (keys['s']) inputDir.y += 1;
    if (keys['a']) inputDir.x -= 1;
    if (keys['d']) inputDir.x += 1;

    if (inputDir.mag() > 0) inputDir = inputDir.norm();

    this.vel = this.vel.mult(0.9);
    let currentSpeed = this.speed;
    if (this.speedBuffTimer > 0) currentSpeed *= 1.5;
    this.vel = this.vel.add(inputDir.mult(currentSpeed * 0.2));
    this.pos = this.pos.add(this.vel);

    if (this.invuln > 0) this.invuln -= dt;
    if (this.pos.mag() > CONFIG.initialArenaRadius) {
      this.pos = this.pos.norm().mult(CONFIG.initialArenaRadius);
    }

    let arrowAimDir = new Vector2D(0, 0);
    if (keys['arrowup']) arrowAimDir.y -= 1;
    if (keys['arrowdown']) arrowAimDir.y += 1;
    if (keys['arrowleft']) arrowAimDir.x -= 1;
    if (keys['arrowright']) arrowAimDir.x += 1;

    if (arrowAimDir.mag() > 0) {
      this.angle = Math.atan2(arrowAimDir.y, arrowAimDir.x);
    } else if (inputMode === 'MOUSE' && mouse.worldX !== undefined) {
      const dx = mouse.worldX - this.pos.x;
      const dy = mouse.worldY - this.pos.y;
      this.angle = Math.atan2(dy, dx);
    } else if (inputDir.mag() > 0) {
      this.angle = Math.atan2(inputDir.y, inputDir.x);
    }

    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.reloadTimer > 0) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) this.ammo = this.weapon.ammo;
    }
  }

  takeDamage(amt: number) {
    if (this.invuln > 0) return;
    if (this.armor > 0) {
      this.armor -= amt;
      if (this.armor < 0) {
        this.hp += this.armor;
        this.armor = 0;
      }
    } else {
      this.hp -= amt;
    }
    this.invuln = 1.0;
    return this.hp <= 0;
  }

  heal(amt: number) {
    this.hp = Math.min(this.maxHp, this.hp + amt);
  }
}

class Mob {
  stats: typeof MOBS[string];
  pos: Vector2D;
  vel: Vector2D;
  hp: number;
  radius: number;
  dead: boolean;
  attackTimer: number;

  constructor(typeKey: string, x: number, y: number) {
    this.stats = MOBS[typeKey];
    this.pos = new Vector2D(x, y);
    this.vel = new Vector2D(0, 0);
    this.hp = this.stats.hp;
    this.radius = this.stats.radius;
    this.dead = false;
    this.attackTimer = 0;
  }

  update(dt: number, playerPos: Vector2D) {
    const dist = this.pos.dist(playerPos);
    const dir = new Vector2D(playerPos.x - this.pos.x, playerPos.y - this.pos.y).norm();

    if (this.stats.type === 'ranged') {
      if (dist > 200) {
        this.vel = dir.mult(this.stats.speed);
      } else {
        this.vel = new Vector2D(0, 0);
        this.attackTimer += dt;
      }
    } else {
      this.vel = dir.mult(this.stats.speed);
    }

    this.pos = this.pos.add(this.vel);
  }

  takeDamage(amt: number) {
    this.hp -= amt;
    if (this.hp <= 0) this.dead = true;
  }
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private setGameState: (updates: Partial<GameState>) => void;
  private player: Player | null = null;
  private mobs: Mob[] = [];
  private keys: Record<string, boolean> = {};
  private mouse: { x: number; y: number; worldX: number; worldY: number; down: boolean } = {
    x: 0,
    y: 0,
    worldX: 0,
    worldY: 0,
    down: false
  };
  private animationFrame: number | null = null;
  private lastTime: number = 0;
  private gameInterval: number | null = null;
  private hexes: Array<{ x: number; y: number; active: boolean }> = [];

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    setGameState: (updates: Partial<GameState>) => void
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.gameState = gameState;
    this.setGameState = setGameState;
    this.setupInput();
    this.generateHexGrid();
  }

  private setupInput() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (this.player) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.mouse.worldX = this.player.pos.x + (e.clientX - centerX);
        this.mouse.worldY = this.player.pos.y + (e.clientY - centerY);
      }
    };

    const handleMouseDown = () => {
      this.mouse.down = true;
    };

    const handleMouseUp = () => {
      this.mouse.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    this.cleanupHandlers.push(() => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    });
  }

  private cleanupHandlers: (() => void)[] = [];

  start() {
    this.player = new Player('knife');
    this.setGameState({ screen: 'GAME', gameOver: false, time: 0 });
    this.lastTime = performance.now();
    this.gameLoop();

    this.gameInterval = window.setInterval(() => {
      if (this.gameState.screen === 'GAME' && !this.gameState.gameOver) {
        this.setGameState({ time: this.gameState.time + 1 });
        if (this.gameState.role === 'FIGHTER' && this.gameState.time % 5 === 0) {
          this.spawnWave();
        }
        if (this.gameState.time >= CONFIG.matchDuration) {
          this.endGame(true);
        }
      }
    }, 1000);
  }

  private spawnWave() {
    const count = Math.floor(this.gameState.time / 20) + 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spawnRadius = this.gameState.arenaRadius * 0.8;
      const x = Math.cos(angle) * spawnRadius;
      const y = Math.sin(angle) * spawnRadius;
      let type = 'goblin';
      if (this.gameState.time > 30 && Math.random() > 0.7) type = 'archer';
      if (this.gameState.time > 60 && Math.random() > 0.8) type = 'ogre';
      this.mobs.push(new Mob(type, x, y));
    }
  }

  private gameLoop = (timestamp: number = 0) => {
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (this.gameState.screen === 'GAME' && !this.gameState.gameOver && this.player) {
      this.update(dt);
      this.draw();
    }

    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number) {
    if (!this.player) return;

    const progress = Math.min(this.gameState.time / CONFIG.matchDuration, 1);
    const targetRadius =
      CONFIG.initialArenaRadius -
      (CONFIG.initialArenaRadius - CONFIG.minArenaRadius) * progress;
    this.setGameState({ arenaRadius: targetRadius });

    const dist = this.player.pos.mag();
    if (dist > this.gameState.arenaRadius) {
      let ticker = this.gameState.zoneDamageTicker + dt;
      if (ticker > 1.0) {
        if (this.player.takeDamage(10)) {
          this.endGame(false);
          return;
        }
        ticker = 0;
      }
      this.setGameState({ zoneDamageTicker: ticker });
    } else {
      this.setGameState({ zoneDamageTicker: 0 });
    }

    this.player.update(dt, this.keys, this.mouse, this.gameState.inputMode);

    this.mobs.forEach((m) => {
      if (this.player) {
        m.update(dt, this.player.pos);
        if (m.pos.dist(this.player.pos) < m.radius + this.player.radius) {
          if (this.player.takeDamage(m.stats.damage)) {
            this.endGame(false);
          }
        }
      }
    });
    this.mobs = this.mobs.filter((m) => !m.dead);
  }

  private draw() {
    this.ctx.fillStyle = CONFIG.colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    const cx = this.canvas.width / 2 - (this.player?.pos.x || 0);
    const cy = this.canvas.height / 2 - (this.player?.pos.y || 0);
    this.ctx.translate(cx, cy);

    this.drawHexGrid();

    if (this.player) {
      this.ctx.save();
      this.ctx.translate(this.player.pos.x, this.player.pos.y);
      this.ctx.rotate(this.player.angle);
      if (this.player.invuln > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
        this.ctx.globalAlpha = 0.5;
      }
      this.ctx.fillStyle = '#fff';
      this.ctx.shadowColor = '#00f3ff';
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.moveTo(10, 0);
      this.ctx.lineTo(-10, 10);
      this.ctx.lineTo(-5, 0);
      this.ctx.lineTo(-10, -10);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }

    this.mobs.forEach((m) => {
      this.ctx.fillStyle = m.stats.color;
      this.ctx.shadowColor = m.stats.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(m.pos.x, m.pos.y, m.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    this.ctx.strokeStyle = '#ff0055';
    this.ctx.lineWidth = 5;
    this.ctx.shadowColor = '#ff0055';
    this.ctx.shadowBlur = 20;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.gameState.arenaRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    this.ctx.restore();
  }

  private generateHexGrid() {
    this.hexes = [];
    const size = CONFIG.hexSize;
    for (let q = -25; q <= 25; q++) {
      for (let r = -25; r <= 25; r++) {
        const x = size * (3 / 2) * q;
        const y = size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r);
        if (x * x + y * y < CONFIG.initialArenaRadius * CONFIG.initialArenaRadius) {
          this.hexes.push({ x, y, active: Math.random() > 0.1 });
        }
      }
    }
  }

  private drawHexGrid() {
    this.ctx.lineWidth = 1;
    this.hexes.forEach((h) => {
      const d2 = h.x * h.x + h.y * h.y;
      if (d2 > CONFIG.initialArenaRadius * CONFIG.initialArenaRadius || !h.active) return;

      const dist = Math.sqrt(d2);
      if (dist > this.gameState.arenaRadius) {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
        this.ctx.strokeStyle = '#550000';
      } else {
        this.ctx.fillStyle = 'rgba(0, 243, 255, 0.05)';
        this.ctx.strokeStyle = '#1a1a2e';
      }

      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (60 * i * Math.PI) / 180;
        this.ctx.lineTo(
          h.x + CONFIG.hexSize * Math.cos(angle),
          h.y + CONFIG.hexSize * Math.sin(angle)
        );
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  private endGame(victory: boolean) {
    this.setGameState({ gameOver: true, screen: 'GAMEOVER' });
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  cleanup() {
    this.cleanupHandlers.forEach(cleanup => cleanup());
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

