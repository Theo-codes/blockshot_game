'use client';

import { useEffect, useState } from 'react';
import { fetchLeaderboard, LeaderboardEntry } from '../lib/supabase';

interface LeaderboardScreenProps {
  playerName: string;
  onClose: () => void;
}

export default function LeaderboardScreen({ playerName, onClose }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchLeaderboard()
      .then(data => { setEntries(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const playerRank = entries.findIndex(e => e.name.toLowerCase() === playerName.toLowerCase());

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-sm border-2 border-gray-700 bg-[#0d0d0d] flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-[0.2em] font-mono">LEADERBOARD</h2>
            <p className="text-xs text-gray-500 font-mono tracking-widest">GLOBAL TOP 20</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white font-mono text-sm tracking-widest transition-colors border border-gray-700 hover:border-gray-500 px-3 py-1"
          >
            CLOSE
          </button>
        </div>

        {/* Player rank banner */}
        {playerRank >= 0 && (
          <div className="mx-4 mt-4 px-4 py-2 border border-teal-800 bg-teal-950/40 flex justify-between items-center">
            <span className="text-teal-400 font-mono text-xs tracking-widest">YOUR RANK</span>
            <span className="text-teal-300 font-mono text-sm font-bold">#{playerRank + 1}</span>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && (
            <div className="flex flex-col gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-800/40 animate-pulse rounded-sm" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-red-400 font-mono text-xs tracking-widest text-center py-8">
              FAILED TO LOAD · CHECK CONNECTION
            </p>
          )}

          {!loading && !error && entries.length === 0 && (
            <p className="text-gray-600 font-mono text-xs tracking-widest text-center py-8">
              NO SCORES YET · BE THE FIRST!
            </p>
          )}

          {!loading && !error && entries.map((entry, i) => {
            const isPlayer = entry.name.toLowerCase() === playerName.toLowerCase();
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div
                key={entry.id ?? i}
                className={`flex items-center gap-3 px-3 py-2.5 mb-1 border transition-colors ${
                  isPlayer
                    ? 'border-teal-700 bg-teal-950/30'
                    : 'border-transparent hover:border-gray-800'
                }`}
              >
                <span className="font-mono text-xs w-6 text-center">
                  {i < 3 ? medals[i] : <span className="text-gray-600">#{i + 1}</span>}
                </span>
                <span className={`font-mono text-sm flex-1 truncate tracking-wide ${isPlayer ? 'text-teal-300' : 'text-gray-300'}`}>
                  {entry.name}
                  {isPlayer && <span className="text-teal-600 text-xs ml-2">YOU</span>}
                </span>
                <span className="font-mono text-xs text-gray-500">LV{entry.level}</span>
                <span className={`font-mono text-sm font-bold ${isPlayer ? 'text-teal-300' : 'text-yellow-400'}`}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-gray-800 text-center">
          <p className="text-gray-600 font-mono text-xs tracking-widest">
            POWERED BY SUPABASE
          </p>
        </div>
      </div>
    </div>
  );
}
