'use client';

import { useState } from 'react';
import { saveSoundSettings, setSfxEnabled } from '../lib/sound';

interface SettingsScreenProps {
  playerName: string;
  music: boolean;
  sfx: boolean;
  onSave: (name: string, music: boolean, sfx: boolean) => void;
  onClose: () => void;
}

export default function SettingsScreen({ playerName, music, sfx, onSave, onClose }: SettingsScreenProps) {
  const [name, setName] = useState(playerName);
  const [musicOn, setMusicOn] = useState(music);
  const [sfxOn, setSfxOn] = useState(sfx);
  const [nameError, setNameError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) { setNameError('At least 2 characters'); return; }
    saveSoundSettings(musicOn, sfxOn);
    setSfxEnabled(sfxOn);
    onSave(trimmed, musicOn, sfxOn);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-sm border-2 border-gray-700 bg-[#0d0d0d]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-[0.2em] font-mono">SETTINGS</h2>
            <p className="text-xs text-gray-500 font-mono tracking-widest">PLAYER PREFERENCES</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white font-mono text-sm tracking-widest transition-colors border border-gray-700 hover:border-gray-500 px-3 py-1"
          >
            CLOSE
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-6">
          {/* Name */}
          <div>
            <label className="block text-xs text-gray-500 font-mono tracking-widest mb-2">PLAYER NAME</label>
            <input
              type="text"
              maxLength={20}
              value={name}
              onChange={e => { setName(e.target.value); setNameError(''); }}
              className="w-full bg-transparent border-2 border-gray-700 text-white font-mono text-sm tracking-widest px-4 py-3 outline-none focus:border-teal-500 transition-colors"
            />
            {nameError && <p className="text-red-400 text-xs font-mono mt-1 tracking-widest">{nameError}</p>}
            <p className="text-gray-600 text-xs font-mono mt-1">{name.trim().length}/20 · SHOWN ON LEADERBOARD</p>
          </div>

          {/* Sound toggles */}
          <div>
            <label className="block text-xs text-gray-500 font-mono tracking-widest mb-3">AUDIO</label>
            <div className="flex flex-col gap-3">
              <ToggleRow
                label="MUSIC"
                sublabel="Background game music"
                value={musicOn}
                onChange={setMusicOn}
              />
              <ToggleRow
                label="SFX"
                sublabel="Shoot, hit, power-up sounds"
                value={sfxOn}
                onChange={setSfxOn}
              />
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`w-full py-3 font-mono text-sm tracking-[0.2em] border-2 transition-colors ${
              saved
                ? 'border-teal-500 bg-teal-500 text-black'
                : 'border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-black'
            }`}
          >
            {saved ? 'SAVED ✓' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, sublabel, value, onChange }: {
  label: string; sublabel: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-mono text-sm tracking-widest">{label}</p>
        <p className="text-gray-600 font-mono text-xs">{sublabel}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 border-2 transition-colors ${
          value ? 'border-teal-500 bg-teal-500/20' : 'border-gray-700 bg-transparent'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 transition-all ${
            value ? 'left-6 bg-teal-400' : 'left-0.5 bg-gray-600'
          }`}
        />
      </button>
    </div>
  );
}
