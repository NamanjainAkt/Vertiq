import { create } from 'zustand'

interface RoutineState {
  /** Set of exercise IDs completed in the current session (optimistic) */
  completedExerciseIds: Set<string>
  toggleExercise: (id: string) => void
  resetExercises: () => void
}

export const useRoutineStore = create<RoutineState>((set) => ({
  completedExerciseIds: new Set(),
  toggleExercise: (id) =>
    set((s) => {
      const next = new Set(s.completedExerciseIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { completedExerciseIds: next }
    }),
  resetExercises: () => set({ completedExerciseIds: new Set() }),
}))
