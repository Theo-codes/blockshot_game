import { GameState, DROP_LABELS, W, H, BW, BH, PW, PH } from './constants';

export function drawFrame(ctx: CanvasRenderingContext2D, gs: GameState) {
  // background
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, W, H);

  // grid
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // bomb flash overlay
  if (gs.bombFlash > 0) {
    ctx.fillStyle = `rgba(226,75,74,${Math.min(0.18, gs.bombFlash / 1000)})`;
    ctx.fillRect(0, 0, W, H);
  }

  // blocks
  ctx.textAlign = 'center';
  gs.blocks.forEach(b => {
    if (!b.alive) return;
    ctx.fillStyle = b.flash > 0 ? '#ffffff' : b.color;
    ctx.fillRect(b.x, b.y, BW, BH);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(b.x, b.y, BW, 2);
    ctx.fillRect(b.x, b.y, 2, BH);
    if (b.maxHp > 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(String(b.hp), b.x + BW / 2, b.y + BH - 5);
    }
  });

  // player bullets
  const bCol = gs.wideTimer > 0 ? '#ED93B1' : '#FAC775';
  gs.bullets.forEach(b => {
    ctx.fillStyle = bCol;
    ctx.fillRect(b.x - 1, b.y, 3, 10);
    ctx.fillStyle = bCol + '55';
    ctx.fillRect(b.x - 2, b.y - 2, 5, 14);
  });

  // enemy bullets
  gs.enemyBullets.forEach(b => {
    ctx.fillStyle = '#E24B4A';
    ctx.fillRect(b.x - 1, b.y, 3, 8);
    ctx.fillStyle = '#E24B4A44';
    ctx.fillRect(b.x - 2, b.y, 5, 10);
  });

  // drops
  gs.drops.forEach(d => {
    const bob = Math.sin(d.pulse) * 3;
    ctx.fillStyle = d.color;
    ctx.fillRect(d.x - d.w / 2, d.y + bob - d.h / 2, d.w, d.h);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(d.x - d.w / 2, d.y + bob - d.h / 2, d.w, 3);
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = '#000';
    ctx.fillText(DROP_LABELS[d.type], d.x, d.y + bob + 5);
  });

  // particles
  gs.particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz);
  });
  ctx.globalAlpha = 1;

  // shield aura
  if (gs.shieldTimer > 0) {
    ctx.strokeStyle = '#378ADD';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.008) * 0.3;
    ctx.strokeRect(gs.px - PW / 2 - 4, gs.py - PH - 4, PW + 8, PH + 8);
    ctx.globalAlpha = 1;
  }

  // player ship
  const shipCol = gs.rapidTimer > 0 ? '#FAC775' : gs.wideTimer > 0 ? '#ED93B1' : '#5DCAA5';
  ctx.fillStyle = shipCol;
  ctx.fillRect(gs.px - PW / 2, gs.py - PH / 2 + 4, PW, PH - 4);
  ctx.fillRect(gs.px - 8, gs.py - PH / 2, 16, 8);
  ctx.fillRect(gs.px - 4, gs.py - PH / 2 - 4, 8, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(gs.px - PW / 2, gs.py - PH / 2 + 4, PW, 2);

  // floor line
  ctx.fillStyle = 'rgba(93,202,165,0.2)';
  ctx.fillRect(0, H - 2, W, 2);

  ctx.textAlign = 'left';
}
