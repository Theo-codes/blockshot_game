import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize only if keys are present to avoid build-time crashes
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export interface LeaderboardEntry {
  id?: number;
  name: string;
  score: number;
  level: number;
  created_at?: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('leaderboard')
    .select('id, name, score, level, created_at')
    .order('score', { ascending: false })
    .limit(20);
  if (error) { console.error('fetchLeaderboard:', error); return []; }
  return data ?? [];
}

export async function submitScore(name: string, score: number, level: number): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('leaderboard')
    .insert({ name: name.trim().slice(0, 20), score, level });
  if (error) console.error('submitScore:', error);
}
