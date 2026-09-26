import { supabase, ensureUserId } from '@/lib/supabase';
import type { PomodoroSettings, PomodoroSession, SessionType } from '@/pages/Home';

const DEFAULT_SETTINGS = {
  work_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 15,
  sessions_before_long_break: 4,
};

export async function fetchSettings(): Promise<PomodoroSettings> {
  const userId = await ensureUserId();
  const { data, error } = await supabase
    .from('pomodoro_settings')
    .select('id, work_minutes, short_break_minutes, long_break_minutes, sessions_before_long_break')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as PomodoroSettings;

  const { data: created, error: insertError } = await supabase
    .from('pomodoro_settings')
    .insert({ user_id: userId, ...DEFAULT_SETTINGS })
    .select('id, work_minutes, short_break_minutes, long_break_minutes, sessions_before_long_break')
    .single();
  if (insertError) throw insertError;
  return created as PomodoroSettings;
}

export async function saveSettingsRemote(next: Omit<PomodoroSettings, 'id'> & { id?: string }): Promise<PomodoroSettings> {
  const userId = await ensureUserId();
  const { data, error } = await supabase
    .from('pomodoro_settings')
    .upsert(
      {
        id: next.id,
        user_id: userId,
        work_minutes: next.work_minutes,
        short_break_minutes: next.short_break_minutes,
        long_break_minutes: next.long_break_minutes,
        sessions_before_long_break: next.sessions_before_long_break,
      },
      { onConflict: 'user_id' }
    )
    .select('id, work_minutes, short_break_minutes, long_break_minutes, sessions_before_long_break')
    .single();
  if (error) throw error;
  return data as PomodoroSettings;
}

export async function fetchSessions(): Promise<PomodoroSession[]> {
  const userId = await ensureUserId();
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('id, session_type, duration_seconds, completed_at, was_completed')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as PomodoroSession[];
}

export async function logSessionRemote(session: {
  session_type: SessionType;
  duration_seconds: number;
  was_completed: boolean;
}): Promise<PomodoroSession> {
  const userId = await ensureUserId();
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert({ user_id: userId, ...session })
    .select('id, session_type, duration_seconds, completed_at, was_completed')
    .single();
  if (error) throw error;
  return data as PomodoroSession;
}
