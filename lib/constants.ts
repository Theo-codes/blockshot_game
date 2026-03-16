export const W = 540;
export const H = 400;
export const BW = 44;
export const BH = 20;
export const BCOLS = 10;
export const BPADX = 6;
export const BPADY = 6;
export const BTOP = 48;
export const PW = 50;
export const PH = 12;
export const PSPD = 4.5;
export const PU_DUR = 8000;

export const BLOCK_COLORS = [
  '#E24B4A', '#FAC775', '#5DCAA5',
  '#378ADD', '#ED93B1', '#97C459',
];

export const DROP_COLORS: Record<string, string> = {
  rapid: '#5DCAA5',
  wide: '#ED93B1',
  shield: '#378ADD',
  bomb: '#E24B4A',
};

export const DROP_LABELS: Record<string, string> = {
  rapid: 'RFR',
  wide: 'WID',
  shield: 'SHD',
  bomb: 'BMB',
};

export type PowerUpType = 'rapid' | 'wide' | 'shield' | 'bomb';

export interface Block {
  x: number; y: number;
  hp: number; maxHp: number;
  color: string; alive: boolean; flash: number;
}

export interface Bullet {
  x: number; y: number; vy: number;
}

export interface EnemyBullet {
  x: number; y: number; vy: number;
}

export interface Drop {
  x: number; y: number; vy: number;
  type: PowerUpType; color: string;
  w: number; h: number; pulse: number;
}

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; color: string; sz: number;
}

export interface GameState {
  status: 'idle' | 'playing' | 'over';
  score: number;
  lives: number;
  level: number;
  px: number;
  py: number;
  bullets: Bullet[];
  enemyBullets: EnemyBullet[];
  blocks: Block[];
  drops: Drop[];
  particles: Particle[];
  shootCD: number;
  enemyTimer: number;
  aliveCount: number;
  rapidTimer: number;
  wideTimer: number;
  shieldTimer: number;
  hasBomb: boolean;
  bombFlash: number;
}
