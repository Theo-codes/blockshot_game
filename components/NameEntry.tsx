'use client';

import { useState } from 'react';

interface NameEntryProps {
  onConfirm: (name: string) => void;
}

export default function NameEntry({ onConfirm }: NameEntryProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Enter a name to continue'); return; }
    if (trimmed.length < 2) { setError('At least 2 characters'); return; }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="w-full max-w-sm mx-4 border-2 border-gray-700 bg-[#0d0d0d] p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-[0.2em] font-mono">BLOCK SHOT</h1>
          <p className="text-xs text-gray-500 tracking-widest mt-2 font-mono">ENTER YOUR NAME TO PLAY</p>
        </div>

        <div className="w-full">
          <input
            autoFocus
            type="text"
            maxLength={20}
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="YOUR NAME"
            className="w-full bg-transparent border-2 border-gray-700 text-white font-mono text-center text-sm tracking-widest px-4 py-3 outline-none focus:border-teal-500 placeholder:text-gray-600 transition-colors"
          />
          {error && <p className="text-red-400 text-xs text-center mt-2 font-mono tracking-widest">{error}</p>}
          <p className="text-gray-600 text-xs text-center mt-2 font-mono">{name.trim().length}/20</p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 border-2 border-teal-500 text-teal-400 font-mono text-sm tracking-[0.2em] hover:bg-teal-500 hover:text-black transition-colors"
        >
          LET'S GO →
        </button>

        <p className="text-gray-600 text-xs font-mono tracking-widest text-center">
          YOUR SCORES WILL APPEAR ON THE GLOBAL LEADERBOARD
        </p>
      </div>
    </div>
  );
}
