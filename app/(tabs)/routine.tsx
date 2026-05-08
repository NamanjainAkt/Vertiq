import { View, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useRoutineStore } from '@/store/routineStore'
import { useTodayRoutine, useCompleteRoutine, DEFAULT_ROUTINE } from '@/hooks/useRoutines'
import { useStreak } from '@/hooks/useStreaks'

type Category = 'stretch' | 'posture' | 'spine'

const exercises = DEFAULT_ROUTINE.exercises

const CATEGORY_META: Record<Category, { color: string; bg: string }> = {
  stretch: { color: dark.glowGreen, bg: 'rgba(0,255,135,0.12)' },
  posture: { color: dark.glowBlue, bg: 'rgba(0,191,255,0.12)' },
  spine: { color: dark.glowPurple, bg: 'rgba(180,79,255,0.12)' },
}

export default function RoutineScreen() {
  const insets = useSafeAreaInsets()
  const completedIds = useRoutineStore((s) => s.completedExerciseIds)
  const toggleExercise = useRoutineStore((s) => s.toggleExercise)
  const { data: todayLog } = useTodayRoutine()
  const { data: routineStreak } = useStreak('routine')
  const completeRoutine = useCompleteRoutine()

  const isRestDay = todayLog?.is_rest_day ?? false
  const total = exercises.length
  const done = completedIds.size
  const pct = total > 0 ? done / total : 0
  const dayNumber = todayLog?.day_number ?? 14
  const routineName = todayLog?.routine_name ?? 'Upper Body Stretch'

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(400)}>
          <Text style={s.routineTitle}>Day {dayNumber} · {routineName}</Text>
          <View style={s.progressRow}>
            <Text style={s.progressText}>{done} / {total} Complete</Text>
            <Text style={s.estTime}>~22 min</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${pct * 100}%` }]} />
          </View>
        </Animated.View>

        {isRestDay ? (
          <RestDayBanner />
        ) : (
          <View style={s.exerciseList}>
            {exercises.map((ex, i) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                isDone={completedIds.has(ex.id)}
                onToggle={() => toggleExercise(ex.id)}
                index={i}
              />
            ))}
          </View>
        )}

        <StreakCard streak={routineStreak?.current_count ?? 0} />
      </ScrollView>

      <View style={[s.ctaWrap, { bottom: TAB_BAR_CLEARANCE + 12 }]}>
        <Pressable
          style={s.cta}
          onPress={() => {
            completeRoutine.mutate({
              routine_name: routineName,
              day_number: dayNumber,
              total_exercises: total,
              completed_exercises: done,
              logged_date: new Date().toISOString().slice(0, 10),
              is_rest_day: isRestDay,
            })
          }}
        >
          <Text style={s.ctaText}>Complete Routine →</Text>
        </Pressable>
      </View>
    </View>
  )
}

interface Exercise {
  id: string
  name: string
  category: Category
  detail: string
  icon: string
}

function ExerciseCard({
  exercise,
  isDone,
  onToggle,
  index,
}: {
  exercise: Exercise
  isDone: boolean
  onToggle: () => void
  index: number
}) {
  const { color, bg } = CATEGORY_META[exercise.category]

  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 60).duration(400)}>
      <Pressable onPress={onToggle} style={[s.exCard, isDone && s.exCardDone]}>
        <View style={[s.exIconWrap, { backgroundColor: bg }]}>
          <Ionicons name={exercise.icon as any} size={20} color={color} />
        </View>
        <View style={s.exInfo}>
          <Text style={[s.exName, isDone && s.exNameDone]}>{exercise.name}</Text>
          <Text style={[s.exDetail, isDone && s.exDetailDone]}>{exercise.detail}</Text>
        </View>
        {isDone ? (
          <View style={[s.checkFilled, glowShadow(dark.glowGreen, 0.3)]}>
            <Ionicons name="checkmark" size={16} color="#000" />
          </View>
        ) : (
          <View style={s.checkEmpty} />
        )}
      </Pressable>
    </Animated.View>
  )
}

function RestDayBanner() {
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
      <GlowCard glow="purple">
        <View style={s.restDayInner}>
          <Ionicons name="walk-outline" size={24} color={dark.glowPurple} />
          <View style={s.restDayInfo}>
            <Text style={s.restDayTitle}>Rest Day</Text>
            <Text style={s.restDaySub}>Light walk encouraged</Text>
          </View>
        </View>
      </GlowCard>
    </Animated.View>
  )
}

function StreakCard({ streak }: { streak: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(500).duration(400)}>
      <GlowCard glow="green">
        <View style={s.streakInner}>
          <View style={s.streakHeader}>
            <Ionicons name="flame" size={22} color={dark.glowGreen} />
            <Text style={s.streakLabel}>{Math.min(streak, 7)} routines this week</Text>
          </View>
          <View style={s.streakBars}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={[s.streakBar, i < Math.min(streak, 7) && s.streakBarFilled]} />
            ))}
          </View>
        </View>
      </GlowCard>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { paddingHorizontal: 20, gap: 24 },
  routineTitle: { fontFamily: Fonts.semibold, fontSize: 22, color: dark.textPrimary, marginBottom: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressText: { fontFamily: Fonts.medium, fontSize: 14, color: dark.textSecond },
  estTime: { fontFamily: Fonts.regular, fontSize: 14, color: dark.textSecond },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: dark.bgBorder, marginBottom: 8 },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: dark.glowGreen },
  exerciseList: { gap: 10 },
  exCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: dark.bgSurface,
    borderRadius: 16, borderWidth: 1, borderColor: dark.bgBorder, padding: 14, gap: 12,
  },
  exCardDone: { opacity: 0.5 },
  exIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exInfo: { flex: 1, gap: 2 },
  exName: { fontFamily: Fonts.regular, fontSize: 16, color: dark.textPrimary },
  exNameDone: { color: dark.textSecond, textDecorationLine: 'line-through' },
  exDetail: { fontFamily: Fonts.mono, fontSize: 13, color: dark.textMuted },
  exDetailDone: { color: dark.textMuted },
  checkEmpty: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: dark.bgBorder },
  checkFilled: { width: 26, height: 26, borderRadius: 13, backgroundColor: dark.glowGreen, alignItems: 'center', justifyContent: 'center' },
  restDayInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  restDayInfo: { gap: 2 },
  restDayTitle: { fontFamily: Fonts.semibold, fontSize: 16, color: dark.textPrimary },
  restDaySub: { fontFamily: Fonts.regular, fontSize: 13, color: dark.textSecond },
  streakInner: { gap: 12 },
  streakHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakLabel: { fontFamily: Fonts.semibold, fontSize: 15, color: dark.textPrimary },
  streakBars: { flexDirection: 'row', gap: 6 },
  streakBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: dark.bgBorder },
  streakBarFilled: { backgroundColor: dark.glowGreen },
  ctaWrap: { position: 'absolute', left: 20, right: 20 },
  cta: {
    backgroundColor: dark.glowGreen, borderRadius: 999, paddingVertical: 16,
    alignItems: 'center', ...glowShadow(dark.glowGreen, 0.35),
  },
  ctaText: { fontFamily: Fonts.bold, fontSize: 16, color: '#000' },
})
