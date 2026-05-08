/**
 * Typed Supabase query functions for TallUp domain tables.
 *
 * Each function checks `isSupabaseEnabled` and falls back gracefully when
 * the backend is not configured. The fallback returns the placeholder value
 * passed in, so callers always get consistent shapes.
 */

import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type {
  HeightLog, HeightLogInsert,
  SleepLog, SleepLogInsert,
  RoutineLog, RoutineLogInsert,
  NutritionLog, NutritionLogInsert,
  HydrationLog, HydrationLogInsert,
  Streak,
  Achievement,
} from '@/lib/types'

// ── Helpers ─────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** When supabase is disabled, silently return the placeholder. */
async function guardedQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseEnabled) return fallback
  return fn()
}

// ── Height Logs ─────────────────────────────────────────────────────────────

export async function fetchHeightLogs(userId: string): Promise<HeightLog[]> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('height_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_date', { ascending: false })
    if (error) throw error
    return data ?? []
  }, [])
}

export async function fetchHeightLogsRange(userId: string, days: number): Promise<HeightLog[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)

  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('height_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_date', sinceStr)
      .order('logged_date', { ascending: true })
    if (error) throw error
    return data ?? []
  }, [])
}

export async function insertHeightLog(log: HeightLogInsert): Promise<HeightLog | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('height_logs')
      .insert(log)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

export async function deleteHeightLog(id: string): Promise<void> {
  return guardedQuery(async () => {
    const { error } = await supabase.from('height_logs').delete().eq('id', id)
    if (error) throw error
  }, undefined)
}

// ── Sleep Logs ──────────────────────────────────────────────────────────────

export async function fetchSleepLogs(userId: string): Promise<SleepLog[]> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_date', { ascending: false })
    if (error) throw error
    return data ?? []
  }, [])
}

export async function fetchSleepLogsRange(userId: string, days: number): Promise<SleepLog[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)

  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_date', sinceStr)
      .order('logged_date', { ascending: true })
    if (error) throw error
    return data ?? []
  }, [])
}

export async function insertSleepLog(log: SleepLogInsert): Promise<SleepLog | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('sleep_logs')
      .insert(log)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

export async function updateSleepLog(id: string, updates: Partial<SleepLogInsert>): Promise<SleepLog | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('sleep_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

export async function deleteSleepLog(id: string): Promise<void> {
  return guardedQuery(async () => {
    const { error } = await supabase.from('sleep_logs').delete().eq('id', id)
    if (error) throw error
  }, undefined)
}

// ── Routine Logs ────────────────────────────────────────────────────────────

export async function fetchRoutineLogs(userId: string): Promise<RoutineLog[]> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('routine_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_date', { ascending: false })
    if (error) throw error
    return data ?? []
  }, [])
}

export async function fetchTodayRoutine(userId: string): Promise<RoutineLog | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('routine_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('logged_date', todayStr())
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

export async function upsertRoutineLog(log: RoutineLogInsert): Promise<RoutineLog | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('routine_logs')
      .upsert(log, { onConflict: 'user_id,logged_date' })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

// ── Nutrition Logs ──────────────────────────────────────────────────────────

export async function fetchNutritionLogs(userId: string): Promise<NutritionLog[]> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_date', { ascending: false })
    if (error) throw error
    return data ?? []
  }, [])
}

export async function fetchTodayNutrition(userId: string): Promise<NutritionLog[]> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('logged_date', todayStr())
    if (error) throw error
    return data ?? []
  }, [])
}

export async function insertNutritionLog(log: NutritionLogInsert): Promise<NutritionLog | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert(log)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

// ── Hydration Logs ──────────────────────────────────────────────────────────

export async function fetchHydrationLog(userId: string): Promise<HydrationLog | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('logged_date', todayStr())
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

export async function upsertHydrationLog(log: HydrationLogInsert): Promise<HydrationLog | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('hydration_logs')
      .upsert(log, { onConflict: 'user_id,logged_date' })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

// ── Streaks ─────────────────────────────────────────────────────────────────

export async function fetchStreaks(userId: string): Promise<Streak[]> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data ?? []
  }, [])
}

export async function upsertStreak(streak_type: Streak['streak_type'], current_count: number, longest_count: number): Promise<Streak | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('streaks')
      .upsert({ streak_type, current_count, longest_count, last_activity_date: todayStr() }, { onConflict: 'user_id,streak_type' })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

// ── Achievements ────────────────────────────────────────────────────────────

export async function fetchAchievements(userId: string): Promise<Achievement[]> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data ?? []
  }, [])
}

export async function insertAchievement(achievement_key: string): Promise<Achievement | null> {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('achievements')
      .insert({ achievement_key })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

// ── Profile ─────────────────────────────────────────────────────────────────

export async function fetchTallUpProfile(userId: string) {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}

export async function updateTallUpProfile(userId: string, updates: Record<string, unknown>) {
  return guardedQuery(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }, null)
}
