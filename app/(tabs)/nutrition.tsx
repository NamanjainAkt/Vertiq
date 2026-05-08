import { useMemo } from 'react'
import { View, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useTodayNutrition } from '@/hooks/useNutritionLogs'
import { useHydration, useLogHydration } from '@/hooks/useHydrationLogs'
import { useNutritionStore } from '@/store/nutritionStore'

const AMBER = '#E07B00'

const NUTRIENTS = ['Calcium', 'Vitamin D', 'Protein', 'Zinc', 'Magnesium', 'Vitamin K2'] as const

const NUTRIENT_TIPS: Record<string, { desc: string; goal: number; unit: string }> = {
  Calcium: { desc: 'Supports bone density and growth plate development', goal: 1200, unit: 'mg' },
  'Vitamin D': { desc: 'Enhances calcium absorption for bone growth', goal: 600, unit: 'IU' },
  Protein: { desc: 'Builds tissue and supports growth hormone', goal: 60, unit: 'g' },
  Zinc: { desc: 'Essential for cell growth and DNA synthesis', goal: 15, unit: 'mg' },
  Magnesium: { desc: 'Supports bone structure and sleep quality', goal: 420, unit: 'mg' },
  'Vitamin K2': { desc: 'Directs calcium to bones not arteries', goal: 120, unit: 'mcg' },
}

const FOODS = [
  { emoji: '🥛', name: 'Milk', nutrient: '300mg Ca', color: AMBER },
  { emoji: '🥚', name: 'Eggs', nutrient: '6g Protein', color: dark.glowGreen },
  { emoji: '🐟', name: 'Salmon', nutrient: '25g Protein', color: dark.glowBlue },
  { emoji: '🥬', name: 'Spinach', nutrient: '100mg Ca', color: dark.glowPurple },
  { emoji: '🥜', name: 'Almonds', nutrient: '75mg Mg', color: dark.glowRed },
]

const SCORE_SEGMENTS = [
  { color: AMBER, label: 'Ca' },
  { color: dark.glowGreen, label: 'D' },
  { color: dark.glowBlue, label: 'Pro' },
  { color: dark.glowPurple, label: 'Zn' },
  { color: dark.glowRed, label: 'Mg' },
]

const D_SIZE = 120
const D_R = 44
const D_SW = 10
const D_CIRCUM = 2 * Math.PI * D_R
const SEG_LEN = D_CIRCUM / 5

export default function NutritionScreen() {
  const insets = useSafeAreaInsets()

  const { data: todayNutrition } = useTodayNutrition()
  const { data: hydration } = useHydration()
  const logHydration = useLogHydration()

  const activePillar = useNutritionStore((s) => s.activePillar)
  const setActivePillar = useNutritionStore((s) => s.setActivePillar)
  const waterGlasses = useNutritionStore((s) => s.waterGlasses)
  const setWaterGlasses = useNutritionStore((s) => s.setWaterGlasses)

  const activeNutrient = NUTRIENTS[activePillar]
  const nutrientInfo = NUTRIENT_TIPS[activeNutrient]

  const todayAmount = useMemo(() => {
    const logs = (todayNutrition ?? []).filter((l) => l.nutrient === activeNutrient.toLowerCase().replace(' ', '_'))
    return logs.reduce((sum, l) => sum + (l.amount_mg ?? 0), 0)
  }, [todayNutrition, activeNutrient])

  const hydratedGlasses = hydration?.glasses ?? waterGlasses
  const waterGoal = hydration?.goal ?? 8

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <HeroNutrient name={activeNutrient} info={nutrientInfo} amount={todayAmount} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(400)}>
          <Text style={s.sectionTitle}>Nutrient Pillars</Text>
          <NutrientPillars active={activePillar} onSelect={setActivePillar} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(400)}>
          <Text style={s.sectionTitle}>Food Sources</Text>
          <FoodGrid />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(340).duration(400)}>
          <Text style={s.sectionTitle}>Hydration</Text>
          <HydrationTracker
            filled={hydratedGlasses}
            goal={waterGoal}
            onFill={(n) => {
              setWaterGlasses(n)
              logHydration.mutate({ glasses: n, logged_date: new Date().toISOString().slice(0, 10), goal: waterGoal })
            }}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(420).duration(400)}>
          <Text style={s.sectionTitle}>Weekly Score</Text>
          <NutritionScore logs={todayNutrition ?? []} />
        </Animated.View>
      </ScrollView>
    </View>
  )
}

// ─── A. Today's Focus Nutrient ──────────────────────────────────────────

function HeroNutrient({ name, info, amount }: { name: string; info: { desc: string; goal: number; unit: string }; amount: number }) {
  const pct = Math.min((amount / info.goal) * 100, 100)

  return (
    <GlowCard glow="amber" style={s.heroCard}>
      <View style={s.heroAccent} />
      <View style={s.heroBody}>
        <View style={s.heroHeader}>
          <View style={s.heroIconWrap}>
            <Ionicons name="flask" size={20} color={AMBER} />
          </View>
          <Text style={s.heroTitle}>{name}</Text>
        </View>
        <Text style={s.heroDesc}>{info.desc}</Text>
        <View style={s.progressSection}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={s.progressLabel}>{amount}{info.unit} / {info.goal}{info.unit}</Text>
        </View>
      </View>
    </GlowCard>
  )
}

// ─── B. Nutrient Pillars ────────────────────────────────────────────────

function NutrientPillars({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillarRow}>
      {NUTRIENTS.map((name, i) => {
        const isActive = i === active
        return (
          <Pressable
            key={name}
            style={[s.pillarChip, isActive && s.pillarChipActive]}
            onPress={() => onSelect(i)}
          >
            <Text style={[s.pillarText, isActive && s.pillarTextActive]}>{name}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

// ─── C. Food Cards ──────────────────────────────────────────────────────

function FoodGrid() {
  return (
    <View style={s.foodGrid}>
      {FOODS.map((food) => (
        <View key={food.name} style={s.foodCard}>
          <Text style={s.foodEmoji}>{food.emoji}</Text>
          <Text style={s.foodName}>{food.name}</Text>
          <Text style={[s.foodNutrient, { color: food.color }]}>{food.nutrient}</Text>
          <Pressable style={s.addBtn}>
            <Ionicons name="add" size={14} color={AMBER} />
            <Text style={s.addText}>Add</Text>
          </Pressable>
        </View>
      ))}
    </View>
  )
}

// ─── D. Hydration Tracker ───────────────────────────────────────────────

function HydrationTracker({ filled, goal, onFill }: { filled: number; goal: number; onFill: (n: number) => void }) {
  return (
    <View style={s.hydrationCard}>
      <View style={s.waterRow}>
        {Array.from({ length: goal }, (_, i) => {
          const full = i < filled
          return (
            <Pressable
              key={i}
              style={[s.waterGlass, full && s.waterGlassFilled]}
              onPress={() => onFill(full ? i : i + 1)}
            >
              <Ionicons name={full ? 'water' : 'water-outline'} size={18} color={full ? dark.glowBlue : dark.textMuted} />
            </Pressable>
          )
        })}
      </View>
      <Text style={s.waterLabel}>{filled} / {goal} glasses</Text>
    </View>
  )
}

// ─── E. Weekly Nutrition Score ──────────────────────────────────────────

import type { NutritionLog } from '@/lib/types'

function NutritionScore({ logs }: { logs: NutritionLog[] }) {
  const score = useMemo(() => {
    if (logs.length === 0) return 0
    const uniqueNutrients = new Set(logs.map((l) => l.nutrient))
    return Math.min(Math.round((uniqueNutrients.size / 5) * 100), 100)
  }, [logs])

  const offset = ((100 - score) / 100) * D_CIRCUM

  return (
    <GlowCard glow="green" compact style={s.scoreCard}>
      <View style={s.scoreRow}>
        <View style={s.donutWrap}>
          <Svg width={D_SIZE} height={D_SIZE}>
            <Circle cx={D_SIZE / 2} cy={D_SIZE / 2} r={D_R} stroke={dark.bgBorder} strokeWidth={D_SW} fill="none" />
            <Circle
              cx={D_SIZE / 2} cy={D_SIZE / 2} r={D_R}
              stroke={dark.glowGreen} strokeWidth={D_SW} fill="none"
              strokeDasharray={D_CIRCUM} strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90, ${D_SIZE / 2}, ${D_SIZE / 2})`}
            />
            {SCORE_SEGMENTS.map((seg, i) => (
              <Circle
                key={seg.label}
                cx={D_SIZE / 2} cy={D_SIZE / 2} r={D_R}
                stroke={seg.color} strokeWidth={D_SW} fill="none"
                strokeDasharray={`${SEG_LEN} ${D_CIRCUM - SEG_LEN}`}
                transform={`rotate(${i * 72 - 90}, ${D_SIZE / 2}, ${D_SIZE / 2})`}
                opacity={0.35}
              />
            ))}
          </Svg>
          <View style={s.scoreCenter}>
            <Text style={s.scoreValue}>{score}</Text>
            <Text style={s.scoreTotal}>/ 100</Text>
          </View>
        </View>
        <View style={s.scoreLegend}>
          {SCORE_SEGMENTS.map((seg) => (
            <View key={seg.label} style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: seg.color }]} />
              <Text style={s.legendText}>{seg.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </GlowCard>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { paddingHorizontal: 20, gap: 20 },
  sectionTitle: {
    fontSize: 14, fontFamily: Fonts.bold, color: dark.textPrimary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  heroCard: { padding: 0, flexDirection: 'row', overflow: 'hidden' },
  heroAccent: { width: 4, backgroundColor: AMBER },
  heroBody: { flex: 1, padding: 16, gap: 8 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: `${AMBER}18`, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 22, fontFamily: Fonts.semibold, color: dark.textPrimary },
  heroDesc: { fontSize: 13, fontFamily: Fonts.regular, color: dark.textSecond, lineHeight: 18 },
  progressSection: { marginTop: 4, gap: 6 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: dark.bgBorder },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: AMBER },
  progressLabel: { fontSize: 12, fontFamily: Fonts.mono, color: dark.textSecond },
  pillarRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  pillarChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: dark.bgSurface, borderWidth: 1, borderColor: dark.bgBorder,
  },
  pillarChipActive: { backgroundColor: AMBER, borderColor: AMBER },
  pillarText: { fontSize: 12, fontFamily: Fonts.semibold, color: dark.textSecond },
  pillarTextActive: { color: '#000' },
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  foodCard: {
    width: '47%', backgroundColor: dark.bgSurface, borderRadius: 16,
    borderWidth: 1, borderColor: dark.bgBorder, padding: 14, gap: 4, alignItems: 'center',
  },
  foodEmoji: { fontSize: 32 },
  foodName: { fontSize: 14, fontFamily: Fonts.semibold, color: dark.textPrimary },
  foodNutrient: { fontSize: 11, fontFamily: Fonts.mono, marginBottom: 6 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: AMBER,
  },
  addText: { fontSize: 12, fontFamily: Fonts.semibold, color: AMBER },
  hydrationCard: {
    backgroundColor: dark.bgSurface, borderRadius: 16,
    borderWidth: 1, borderColor: dark.bgBorder, padding: 16, gap: 12, alignItems: 'center',
  },
  waterRow: { flexDirection: 'row', gap: 8 },
  waterGlass: {
    width: 36, height: 44, borderRadius: 8,
    backgroundColor: dark.bgElevated, borderWidth: 1, borderColor: dark.bgBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  waterGlassFilled: {
    backgroundColor: 'rgba(0,191,255,0.15)', borderColor: dark.glowBlue,
    ...glowShadow(dark.glowBlue, 0.25),
  },
  waterLabel: { fontSize: 13, fontFamily: Fonts.semibold, color: dark.textSecond },
  scoreCard: { padding: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  donutWrap: { width: D_SIZE, height: D_SIZE, alignItems: 'center', justifyContent: 'center' },
  scoreCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontFamily: Fonts.display, fontSize: 36, color: dark.textPrimary, lineHeight: 38 },
  scoreTotal: { fontFamily: Fonts.regular, fontSize: 11, color: dark.textMuted },
  scoreLegend: { gap: 6, flex: 1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: Fonts.medium, color: dark.textSecond },
})
