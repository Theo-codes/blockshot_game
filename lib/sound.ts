'use client';

// Tiny Web Audio based sound manager
// All sounds are synthesized — no asset files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.15) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch { /* silent fail */ }
}

export const SFX = {
  shoot() { beep(880, 0.05, 'square', 0.08); },
  hit()   { beep(220, 0.07, 'sawtooth', 0.12); },
  explode() {
    try {
      const ac = getCtx();
      const buf = ac.createBuffer(1, ac.sampleRate * 0.15, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buf;
      const gain = ac.createGain();
      src.connect(gain); gain.connect(ac.destination);
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      src.start(); src.stop(ac.currentTime + 0.15);
    } catch { }
  },
  powerup() {
    beep(440, 0.05, 'sine', 0.12);
    setTimeout(() => beep(660, 0.05, 'sine', 0.12), 60);
    setTimeout(() => beep(880, 0.1, 'sine', 0.12), 120);
  },
  die()    { beep(110, 0.3, 'sawtooth', 0.2); },
  levelup() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'sine', 0.15), i * 80));
  },
  bomb() {
    beep(60, 0.4, 'sawtooth', 0.25);
    setTimeout(() => SFX.explode(), 50);
  },
};

// settings state — read from localStorage
export function getSoundSettings(): { music: boolean; sfx: boolean } {
  try {
    return {
      music: localStorage.getItem('bs_music') !== 'false',
      sfx: localStorage.getItem('bs_sfx') !== 'false',
    };
  } catch { return { music: true, sfx: true }; }
}

export function saveSoundSettings(music: boolean, sfx: boolean) {
  try {
    localStorage.setItem('bs_music', String(music));
    localStorage.setItem('bs_sfx', String(sfx));
  } catch { }
}

let sfxEnabled = true;
export function setSfxEnabled(v: boolean) { sfxEnabled = v; }
export function playSFX(name: keyof typeof SFX) {
  if (!sfxEnabled) return;
  SFX[name]();
}
