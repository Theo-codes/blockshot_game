import {
  Block, Bullet, Drop, Particle, PowerUpType,
  BLOCK_COLORS, DROP_COLORS, BW, BH, BCOLS,
  BPADX, BPADY, BTOP, PU_DUR,
} from './constants';

export function makeBlocks(level: number): { blocks: Block[]; aliveCount: number } {
  const blocks: Block[] = [];
  const rows = Math.min(3 + Math.floor((level - 1) / 2), 6);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < BCOLS; c++) {
      const hp = r < 2 ? 1 : r < 4 ? 2 : 3;
      blocks.push({
        x: BPADX + c * (BW + BPADX),
        y: BTOP + r * (BH + BPADY),
        hp, maxHp: hp,
        color: BLOCK_COLORS[r % BLOCK_COLORS.length],
        alive: true, flash: 0,
      });
    }
  }
  return { blocks, aliveCount: blocks.length };
}

export function spawnParticles(
  particles: Particle[], x: number, y: number, color: string, n: number
): Particle[] {
  const next = [...particles];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 3.5;
    next.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color, sz: 2 + Math.floor(Math.random() * 3) });
  }
  return next;
}

export function maybeSpawnDrop(drops: Drop[], x: number, y: number): Drop[] {
  if (Math.random() > 0.18) return drops;
  const types: PowerUpType[] = ['rapid', 'wide', 'shield', 'bomb'];
  const t = types[Math.floor(Math.random() * types.length)];
  return [...drops, { x, y, vy: 1.5, type: t, color: DROP_COLORS[t], w: 18, h: 18, pulse: 0 }];
}

export function makeBullets(
  px: number, py: number, PH: number, wideActive: boolean
): Bullet[] {
  if (wideActive) {
    return [
      { x: px - 14, y: py - PH / 2 - 4, vy: -9 },
      { x: px,      y: py - PH / 2 - 4, vy: -9 },
      { x: px + 14, y: py - PH / 2 - 4, vy: -9 },
    ];
  }
  return [{ x: px, y: py - PH / 2 - 4, vy: -9 }];
}
