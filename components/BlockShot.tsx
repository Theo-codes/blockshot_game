'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useGame } from './useGame';
import { submitScore } from '../lib/supabase';
import { getSoundSettings, setSfxEnabled } from '../lib/sound';
import NameEntry from './NameEntry';
import LeaderboardScreen from './LeaderboardScreen';
import SettingsScreen from './SettingsScreen';

export default function BlockShot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [hi, setHi] = useState(0);
  const [rapidTimer, setRapid] = useState(0);
  const [wideTimer, setWide] = useState(0);
  const [shieldTimer, setShield] = useState(0);
  const [hasBomb, setHasBomb] = useState(false);
  const [overlayState, setOverlayState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [finalScore, setFinalScore] = useState(0);
  const [finalLevel, setFinalLevel] = useState(1);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // store playerName in a ref so the game loop callback always sees latest value
  const playerNameRef = useRef<string | null>(null);
  useEffect(() => { playerNameRef.current = playerName; }, [playerName]);

  useEffect(() => {
    const saved = localStorage.getItem('bs_player_name');
    if (saved) setPlayerName(saved);
    else setShowNameEntry(true);
    const { music, sfx } = getSoundSettings();
    setMusicOn(music); setSfxOn(sfx); setSfxEnabled(sfx);
    try { setHi(parseInt(localStorage.getItem('bs3_hi') || '0')); } catch { }
  }, []);

  const handleNameConfirm = (name: string) => {
    setPlayerName(name);
    playerNameRef.current = name;
    localStorage.setItem('bs_player_name', name);
    setShowNameEntry(false);
  };

  const handleSettingsSave = (name: string, music: boolean, sfx: boolean) => {
    setPlayerName(name);
    playerNameRef.current = name;
    localStorage.setItem('bs_player_name', name);
    setMusicOn(music); setSfxOn(sfx); setSfxEnabled(sfx);
  };

  const handlePowerUps = useCallback((r: number, w: number, sh: number, bomb: boolean) => {
    setRapid(r); setWide(w); setShield(sh); setHasBomb(bomb);
  }, []);

  const handleGameOver = useCallback((s: number, lv: number) => {
    setFinalScore(s);
    setFinalLevel(lv);
    setOverlayState('over');
    setHi(h => {
      const newHi = Math.max(h, s);
      try { localStorage.setItem('bs3_hi', String(newHi)); } catch { }
      return newHi;
    });

    const name = playerNameRef.current;
    if (name && s > 0) {
      setSubmitStatus('saving');
      submitScore(name, s, lv)
        .then(() => setSubmitStatus('saved'))
        .catch(() => setSubmitStatus('error'));
    }
  }, []);

  const handleStart = useCallback(() => setOverlayState('playing'), []);

  const { startGame, useBomb } = useGame(
    canvasRef, setScore, setLives, setLevel,
    handlePowerUps, handleGameOver, handleStart,
  );

  const handleStartClick = () => {
    if (!playerName) { setShowNameEntry(true); return; }
    setOverlayState('playing');
    setSubmitStatus('idle');
    startGame();
  };

  const handleOpenLeaderboard = () => {
    // if still saving, wait until done then open
    if (submitStatus === 'saving') {
      const poll = setInterval(() => {
        setSubmitStatus(s => {
          if (s !== 'saving') {
            clearInterval(poll);
            setShowLeaderboard(true);
          }
          return s;
        });
      }, 200);
    } else {
      setShowLeaderboard(true);
    }
  };

  return (
    <>
      {showNameEntry && <NameEntry onConfirm={handleNameConfirm} />}
      {showLeaderboard && playerName && (
        <LeaderboardScreen
          playerName={playerName}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      {showSettings && playerName && (
        <SettingsScreen
          playerName={playerName}
          music={musicOn}
          sfx={sfxOn}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="w-full font-mono select-none">
        <div className="flex justify-between items-center px-0.5 py-2 text-xs tracking-widest text-gray-400">
          <span>SCORE <b className="text-white">{score}</b></span>
          <span>LEVEL <b className="text-white">{level}</b></span>
          <span>BEST <b className="text-white">{hi}</b></span>
          <span>LIVES <b className="text-white">{lives}</b></span>
        </div>

        <div className="flex items-center justify-between pb-2 gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <PowerSlot label="RAPID" timer={rapidTimer} activeColor="text-teal-400 border-teal-400" />
            <PowerSlot label="WIDE" timer={wideTimer} activeColor="text-pink-400 border-pink-400" />
            <PowerSlot label="SHIELD" timer={shieldTimer} activeColor="text-blue-400 border-blue-400" />
            <button
              onClick={useBomb}
              className={`px-3 py-1 border text-xs tracking-widest transition-colors ${hasBomb ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-gray-700 text-gray-600'
                }`}
            >
              BOMB {hasBomb ? '✓' : '✕'}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleOpenLeaderboard} title="Leaderboard"
              className="px-3 py-1 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white text-sm transition-colors">
              🏆
            </button>
            <button onClick={() => setShowSettings(true)} title="Settings"
              className="px-3 py-1 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white text-sm transition-colors">
              ⚙
            </button>
          </div>
        </div>

        <div className="relative w-full">
          <canvas
            ref={canvasRef}
            width={540}
            height={400}
            className="block w-full border-2 border-gray-800 bg-[#0d0d0d] touch-none"
            style={{ imageRendering: 'pixelated' }}
          />
          {overlayState !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d0d0d]/93 border-2 border-gray-800">
              <h1 className="text-2xl font-bold text-white tracking-[0.2em] font-mono">
                {overlayState === 'over' ? 'GAME OVER' : 'BLOCK SHOT'}
              </h1>
              {overlayState === 'over' && (
                <>
                  <p className="text-xs text-gray-500 tracking-widest font-mono">LEVEL {finalLevel} REACHED</p>
                  <p className="text-lg text-yellow-400 tracking-widest font-mono">SCORE: {finalScore.toLocaleString()}</p>
                  <p className="text-xs font-mono tracking-widest">
                    {submitStatus === 'saving' && <span className="text-gray-500">SAVING TO LEADERBOARD...</span>}
                    {submitStatus === 'saved' && <span className="text-teal-500">✓ SCORE SAVED · {(playerName ?? '').toUpperCase()}</span>}
                    {submitStatus === 'error' && <span className="text-red-400">FAILED TO SAVE SCORE</span>}
                  </p>
                </>
              )}
              {overlayState === 'idle' && playerName && (
                <p className="text-xs text-teal-500 tracking-widest font-mono">
                  WELCOME, {playerName.toUpperCase()}
                </p>
              )}
              {overlayState === 'idle' && (
                <p className="text-xs text-gray-500 tracking-widest text-center font-mono leading-relaxed">
                  ← → / MOUSE TO MOVE · SPACE TO SHOOT<br />
                  B KEY = BOMB · COLLECT DROPS FOR POWER-UPS
                </p>
              )}
              <div className="flex gap-3 flex-wrap justify-center">
                <button onClick={handleStartClick}
                  className="px-8 py-2.5 border-2 border-teal-500 text-teal-400 text-sm tracking-[0.2em] font-mono hover:bg-teal-500 hover:text-black transition-colors">
                  {overlayState === 'over' ? 'RETRY' : 'START'}
                </button>
                {overlayState === 'over' && (
                  <button
                    onClick={handleOpenLeaderboard}
                    disabled={submitStatus === 'saving'}
                    className={`px-6 py-2.5 border-2 text-sm tracking-[0.2em] font-mono transition-colors ${submitStatus === 'saving'
                        ? 'border-gray-700 text-gray-600 cursor-wait'
                        : 'border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-black'
                      }`}
                  >
                    {submitStatus === 'saving' ? 'SAVING...' : '🏆 RANKS'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 tracking-widest pt-2 md:hidden">
          DRAG TO MOVE · AUTO-FIRES · TAP BOMB TO USE
        </p>
        <p className="text-center text-xs text-gray-600 tracking-widest pt-2 hidden md:block">
          ← → / MOUSE · SPACE TO SHOOT · B FOR BOMB
        </p>
      </div>
    </>
  );
}

function PowerSlot({ label, timer, activeColor }: { label: string; timer: number; activeColor: string }) {
  const active = timer > 0;
  return (
    <div className={`px-3 py-1 border text-xs tracking-widest min-w-[80px] text-center transition-colors ${active ? activeColor : 'border-gray-700 text-gray-600'
      }`}>
      {label} {active ? `${Math.ceil(timer / 1000)}s` : 'OFF'}
    </div>
  );
}