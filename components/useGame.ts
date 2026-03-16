'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GameState, W, H, PW, PH, PSPD, PU_DUR } from '../lib/constants';
import { makeBlocks, spawnParticles, maybeSpawnDrop, makeBullets } from '../lib/gameLogic';
import { drawFrame } from '../lib/draw';

const INITIAL_STATE = (): GameState => ({
  status: 'idle',
  score: 0, lives: 3, level: 1,
  px: W / 2, py: H - 28,
  bullets: [], enemyBullets: [], blocks: [], drops: [], particles: [],
  shootCD: 0, enemyTimer: 0, aliveCount: 0,
  rapidTimer: 0, wideTimer: 0, shieldTimer: 0,
  hasBomb: false, bombFlash: 0,
});

export function useGame(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onScoreChange: (s: number) => void,
  onLivesChange: (l: number) => void,
  onLevelChange: (lv: number) => void,
  onPowerUps: (r: number, w: number, sh: number, bomb: boolean) => void,
  onGameOver: (score: number, level: number) => void,
  onStart: () => void,
) {
  const gsRef = useRef<GameState>(INITIAL_STATE());
  const animRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const hiRef = useRef<number>(0);

  useEffect(() => {
    try { hiRef.current = parseInt(localStorage.getItem('bs3_hi') || '0'); } catch { }
  }, []);

  const startGame = useCallback(() => {
    const { blocks, aliveCount } = makeBlocks(1);
    gsRef.current = {
      ...INITIAL_STATE(),
      status: 'playing',
      blocks, aliveCount,
    };
    onScoreChange(0); onLivesChange(3); onLevelChange(1);
    onPowerUps(0, 0, 0, false);
    onStart();
    lastTsRef.current = performance.now();
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);
  }, []); // eslint-disable-line

  const useBomb = useCallback(() => {
    const gs = gsRef.current;
    if (!gs.hasBomb || gs.status !== 'playing') return;
    gs.hasBomb = false;
    gs.bombFlash = 400;
    gs.enemyBullets = [];
    gs.blocks.forEach(b => {
      if (!b.alive) return;
      b.hp--;
      if (b.hp <= 0) {
        b.alive = false;
        gs.aliveCount--;
        gs.score += 10 * gs.level;
        gs.particles = spawnParticles(gs.particles, b.x + BW / 2, b.y + BH / 2, b.color, 10);
      } else { b.flash = 300; }
    });
    onScoreChange(gs.score);
    onPowerUps(gs.rapidTimer, gs.wideTimer, gs.shieldTimer, gs.hasBomb);
    if (gs.aliveCount <= 0) nextLevel();
  }, []); // eslint-disable-line

  function nextLevel() {
    const gs = gsRef.current;
    gs.level++;
    const { blocks, aliveCount } = makeBlocks(gs.level);
    gs.blocks = blocks; gs.aliveCount = aliveCount;
    gs.bullets = []; gs.enemyBullets = []; gs.drops = [];
    gs.shootCD = 0; gs.enemyTimer = 0;
    onLevelChange(gs.level);
  }

  function loseLife() {
    const gs = gsRef.current;
    if (gs.shieldTimer > 0) { gs.shieldTimer = 0; onPowerUps(gs.rapidTimer, gs.wideTimer, 0, gs.hasBomb); return; }
    gs.lives--;
    gs.particles = spawnParticles(gs.particles, gs.px, gs.py, '#E24B4A', 14);
    onLivesChange(gs.lives);
    if (gs.lives <= 0) {
      gs.status = 'over';
      cancelAnimationFrame(animRef.current);
      if (gs.score > hiRef.current) {
        hiRef.current = gs.score;
        try { localStorage.setItem('bs3_hi', String(gs.score)); } catch { }
      }
      onGameOver(gs.score, gs.level);
    }
  }

  function shoot() {
    const gs = gsRef.current;
    if (gs.shootCD > 0) return;
    const newBullets = makeBullets(gs.px, gs.py, PH, gs.wideTimer > 0);
    gs.bullets = [...gs.bullets, ...newBullets];
    gs.shootCD = gs.rapidTimer > 0 ? 60 : 160;
  }

  const tick = useCallback((ts: number) => {
    const dt = Math.min(ts - lastTsRef.current, 50);
    lastTsRef.current = ts;
    const gs = gsRef.current;
    if (gs.status !== 'playing') return;

    // keyboard movement
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) gs.px = Math.max(PW / 2, gs.px - PSPD);
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) gs.px = Math.min(W - PW / 2, gs.px + PSPD);
    if (keysRef.current[' '] || keysRef.current['ArrowUp']) shoot();

    // auto-fire for mobile (always fires when no keyboard shoot)
    shoot();

    // timers
    gs.shootCD = Math.max(0, gs.shootCD - dt);
    if (gs.rapidTimer > 0) gs.rapidTimer = Math.max(0, gs.rapidTimer - dt);
    if (gs.wideTimer > 0) gs.wideTimer = Math.max(0, gs.wideTimer - dt);
    if (gs.shieldTimer > 0) gs.shieldTimer = Math.max(0, gs.shieldTimer - dt);
    if (gs.bombFlash > 0) gs.bombFlash = Math.max(0, gs.bombFlash - dt);
    onPowerUps(gs.rapidTimer, gs.wideTimer, gs.shieldTimer, gs.hasBomb);

    // enemy shoot
    gs.enemyTimer -= dt;
    if (gs.enemyTimer <= 0) {
      const alive = gs.blocks.filter(b => b.alive);
      if (alive.length) {
        const b = alive[Math.floor(Math.random() * alive.length)];
        gs.enemyBullets.push({ x: b.x + BW / 2, y: b.y + BH, vy: 2 + gs.level * 0.3 });
      }
      gs.enemyTimer = Math.max(320, 1500 - gs.level * 90);
    }

    // move bullets
    gs.bullets.forEach(b => { b.y += b.vy; });
    gs.bullets = gs.bullets.filter(b => b.y > -20);
    gs.enemyBullets.forEach(b => { b.y += b.vy; });
    gs.enemyBullets = gs.enemyBullets.filter(b => b.y < H + 20);
    gs.drops.forEach(d => { d.y += d.vy; d.pulse += dt * 0.005; });
    gs.drops = gs.drops.filter(d => d.y < H + 30);

    // bullet vs block collision
    for (let i = gs.bullets.length - 1; i >= 0; i--) {
      const bl = gs.bullets[i]; let hit = false;
      for (let j = 0; j < gs.blocks.length; j++) {
        const bk = gs.blocks[j];
        if (!bk.alive) continue;
        if (bl.x >= bk.x - 2 && bl.x <= bk.x + BW + 2 && bl.y >= bk.y && bl.y <= bk.y + BH) {
          bk.hp--; bk.flash = 110;
          gs.particles = spawnParticles(gs.particles, bl.x, bl.y, bk.color, 4);
          if (bk.hp <= 0) {
            bk.alive = false; gs.aliveCount--;
            gs.score += 10 * gs.level;
            gs.particles = spawnParticles(gs.particles, bk.x + BW / 2, bk.y + BH / 2, bk.color, 11);
            gs.drops = maybeSpawnDrop(gs.drops, bk.x + BW / 2, bk.y + BH / 2);
            onScoreChange(gs.score);
          }
          hit = true; break;
        }
      }
      if (hit) gs.bullets.splice(i, 1);
    }

    // enemy bullet vs player
    for (let i = gs.enemyBullets.length - 1; i >= 0; i--) {
      const eb = gs.enemyBullets[i];
      if (eb.x >= gs.px - PW / 2 && eb.x <= gs.px + PW / 2 && eb.y >= gs.py - PH && eb.y <= gs.py) {
        gs.enemyBullets.splice(i, 1);
        loseLife();
        if (gs.status !== 'playing') return;
      }
    }

    // drops vs player
    for (let i = gs.drops.length - 1; i >= 0; i--) {
      const d = gs.drops[i];
      if (d.x >= gs.px - PW / 2 && d.x <= gs.px + PW / 2 && d.y >= gs.py - PH - d.h && d.y <= gs.py) {
        if (d.type === 'rapid') gs.rapidTimer = PU_DUR;
        else if (d.type === 'wide') gs.wideTimer = PU_DUR;
        else if (d.type === 'shield') gs.shieldTimer = PU_DUR;
        else if (d.type === 'bomb') gs.hasBomb = true;
        gs.particles = spawnParticles(gs.particles, d.x, d.y, d.color, 10);
        gs.drops.splice(i, 1);
        onPowerUps(gs.rapidTimer, gs.wideTimer, gs.shieldTimer, gs.hasBomb);
      }
    }

    // update flashes & particles
    gs.blocks.forEach(b => { if (b.flash > 0) b.flash -= dt; });
    gs.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= 0.9; p.vy *= 0.9; p.life -= 0.025; });
    gs.particles = gs.particles.filter(p => p.life > 0);

    if (gs.aliveCount <= 0) nextLevel();

    // draw
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawFrame(ctx, gs);
    }

    animRef.current = requestAnimationFrame(tick);
  }, []); // eslint-disable-line

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'b', 'B'].includes(e.key)) e.preventDefault();
      if ((e.key === 'b' || e.key === 'B') && gsRef.current.status === 'playing') useBomb();
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [useBomb]);

  // touch drag
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (gsRef.current.status !== 'playing') return;
      const r = canvas.getBoundingClientRect();
      const tx = (e.touches[0].clientX - r.left) * (W / r.width);
      gsRef.current.px = Math.max(PW / 2, Math.min(W - PW / 2, tx));
    };
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => canvas.removeEventListener('touchmove', onTouchMove);
  }, [canvasRef]);

  return { startGame, useBomb, hi: hiRef.current };
}

// re-export BW/BH for draw.ts usage inside hook
const BW = 44, BH = 20;
