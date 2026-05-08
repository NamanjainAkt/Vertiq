import { create } from 'zustand'

interface NutritionState {
  /** Today's water glasses count (optimistic) */
  waterGlasses: number
  setWaterGlasses: (n: number) => void
  /** Selected nutrient pillar index */
  activePillar: number
  setActivePillar: (i: number) => void
}

export const useNutritionStore = create<NutritionState>((set) => ({
  waterGlasses: 0,
  setWaterGlasses: (n) => set({ waterGlasses: n }),
  activePillar: 0,
  setActivePillar: (i) => set({ activePillar: i }),
}))
