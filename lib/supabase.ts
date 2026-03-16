import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeaderboardEntry {
  id?: number;
  name: string;
  score: number;
  level: number;
  created_at?: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('id, name, score, level, created_at')
    .order('score', { ascending: false })
    .limit(20);
  if (error) { console.error('fetchLeaderboard:', error); return []; }
  return data ?? [];
}

export async function submitScore(name: string, score: number, level: number): Promise<void> {
  const trimmedName = name.trim().slice(0, 20);

  // Check if player already has a score
  const { data: existing } = await supabase
    .from('leaderboard')
    .select('id, score')
    .eq('name', trimmedName)
    .single();

  if (existing) {
    // Only update if new score is higher
    if (score > existing.score) {
      const { error } = await supabase
        .from('leaderboard')
        .update({ score, level })
        .eq('id', existing.id);
      if (error) console.error('submitScore update:', error);
    }
  } else {
    // First time playing — insert new row
    const { error } = await supabase
      .from('leaderboard')
      .insert({ name: trimmedName, score, level });
    if (error) console.error('submitScore insert:', error);
  }
}