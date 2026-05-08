/** TallUp domain types — mirrors supabase/migrations/20260508000000_tallup_domain.sql */

// ── Profile extensions ─────────────────────────────────────────────────────

export interface TallUpProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  age: number | null
  biological_sex: string | null
  ethnicity: string | null
  height_cm: number | null
  weight_kg: number | null
  goal_height_cm: number | null
  commitment_days: number
  plan_type: 'free' | 'premium'
  created_at: string
}

// ── Height ──────────────────────────────────────────────────────────────────

export interface HeightLog {
  id: string
  user_id: string
  height_cm: number
  logged_date: string
  notes: string | null
  created_at: string
}

export type HeightLogInsert = Pick<HeightLog, 'height_cm' | 'logged_date'> & Partial<Pick<HeightLog, 'notes'>>

// ── Sleep ───────────────────────────────────────────────────────────────────

export interface SleepLog {
  id: string
  user_id: string
  logged_date: string
  bedtime: string // HH:mm format
  wake_time: string
  duration_min: number
  quality_score: 1 | 2 | 3 | 4 | 5 | null
  notes: string | null
  created_at: string
}

export type SleepLogInsert = Pick<SleepLog, 'bedtime' | 'wake_time' | 'duration_min' | 'logged_date'> & Partial<Pick<SleepLog, 'quality_score' | 'notes'>>

// ── Routine ─────────────────────────────────────────────────────────────────

export interface RoutineLog {
  id: string
  user_id: string
  routine_name: string
  day_number: number
  total_exercises: number
  completed_exercises: number
  duration_min: number | null
  is_rest_day: boolean
  logged_date: string
  created_at: string
}

export type RoutineLogInsert = Pick<RoutineLog, 'routine_name' | 'day_number' | 'total_exercises' | 'completed_exercises' | 'logged_date'> & Partial<Pick<RoutineLog, 'duration_min' | 'is_rest_day'>>

export interface RoutineExercise {
  id: string
  name: string
  category: 'stretch' | 'posture' | 'spine'
  detail: string
  icon: string
  sets: number
  reps: string
}

export interface RoutineTemplate {
  id: string
  name: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  calories: string
  target: string
  exercises: RoutineExercise[]
}

// ── Nutrition ───────────────────────────────────────────────────────────────

export interface NutritionLog {
  id: string
  user_id: string
  logged_date: string
  nutrient: string // calcium, vitamin_d, protein, zinc, magnesium, vitamin_k2
  food_name: string | null
  amount_mg: number | null
  goal_mg: number
  created_at: string
}

export type NutritionLogInsert = Pick<NutritionLog, 'nutrient' | 'logged_date'> & Partial<Pick<NutritionLog, 'food_name' | 'amount_mg' | 'goal_mg'>>

// ── Hydration ───────────────────────────────────────────────────────────────

export interface HydrationLog {
  id: string
  user_id: string
  logged_date: string
  glasses: number
  goal: number
  created_at: string
}

export type HydrationLogInsert = Pick<HydrationLog, 'glasses' | 'logged_date'> & Partial<Pick<HydrationLog, 'goal'>>

// ── Streaks ─────────────────────────────────────────────────────────────────

export type StreakType = 'height' | 'sleep' | 'routine' | 'nutrition'

export interface Streak {
  id: string
  user_id: string
  streak_type: StreakType
  current_count: number
  longest_count: number
  last_activity_date: string | null
  created_at: string
  updated_at: string
}

// ── Achievements ────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  user_id: string
  achievement_key: string
  unlocked_at: string
}

// ── Aggregated dashboard types ──────────────────────────────────────────────

export interface WeeklyHeightPoint {
  date: string
  cm: number
}

export interface DashboardData {
  currentHeightCm: number
  monthlyGainCm: number
  goalProgressPct: number
  streakDays: number
  todayRoutine: {
    name: string
    completed: number
    total: number
  } | null
  lastSleep: {
    durationMin: number
    qualityLabel: string
  } | null
  weeklyHeight: WeeklyHeightPoint[]
}
