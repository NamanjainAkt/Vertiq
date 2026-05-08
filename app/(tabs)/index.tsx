import { View, ScrollView, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Svg, { Polyline } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { ProgressRing } from '@/components/ProgressRing'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useProfile } from '@/hooks/useProfile'
import { useLatestHeight, useHeightLogsRange } from '@/hooks/useHeightLogs'
import { useStreak } from '@/hooks/useStreaks'
import { useTodayRoutine } from '@/hooks/useRoutines'
import { useLastSleep } from '@/hooks/useSleepLogs'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

export default function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const { data: profile } = useProfile()
  const { data: latestHeight } = useLatestHeight()
  const { data: monthLogs } = useHeightLogsRange(30)
  const { data: routineStreak } = useStreak('routine')
  const { data: todayRoutine } = useTodayRoutine()
  const { data: lastSleep } = useLastSleep()

  const currentCm = latestHeight?.height_cm ?? 173.2
  const logs = monthLogs ?? []
  const prevCm = logs.length > 1 ? logs[logs.length - 1].height_cm : currentCm
  const monthlyGain = Math.round((currentCm - prevCm) * 10) / 10
  const goalProgress = 72
  const streakDays = routineStreak?.current_count ?? 12

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Naman'

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* A. Header */}
        <Header name={firstName} initials={profile?.initials ?? 'NN'} />

        {/* B. Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <GlowCard glow="green" style={s.heroCard}>
            <View style={s.heroInner}>
              <View style={s.heroLeft}>
                <Text style={s.heroLabel}>Current Height</Text>
                <Text style={s.heroValue}>{currentCm.toFixed(1)} cm</Text>
                <View style={s.heroBadge}>
                  <Ionicons name="trending-up" size={12} color="#000" />
                  <Text style={s.heroBadgeText}>+{monthlyGain.toFixed(1)} cm this month</Text>
                </View>
              </View>
              <ProgressRing
                progress={goalProgress}
                size={90}
                strokeWidth={7}
                color={dark.glowPurple}
                centerValue={`${goalProgress}%`}
                centerLabel="of goal"
              />
            </View>
          </GlowCard>
        </Animated.View>

        {/* C. Daily Streak Strip */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)}>
          <StreakStrip streakDays={streakDays} />
        </Animated.View>

        {/* D. Task Cards (2-column grid) */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)}>
          <Text style={s.sectionTitle}>Today</Text>
          <View style={s.taskGrid}>
            <TaskCard
              icon="fitness-outline"
              label="Stretch Routine"
              detail={
                todayRoutine
                  ? `${todayRoutine.completed_exercises} of ${todayRoutine.total_exercises} done`
                  : 'Pending'
              }
              progress={todayRoutine ? todayRoutine.completed_exercises / Math.max(todayRoutine.total_exercises, 1) : 0}
              glow="green"
            />
            <TaskCard
              icon="moon-outline"
              label="Sleep Last Night"
              detail={
                lastSleep
                  ? `${Math.floor(lastSleep.duration_min / 60)}h ${lastSleep.duration_min % 60}m · ${lastSleep.quality_score ? ['Poor', 'Fair', 'Okay', 'Good', 'Great'][lastSleep.quality_score - 1] : '--'}`
                  : 'No data'
              }
              glow="blue"
            />
            <TaskCard
              icon="nutrition-outline"
              label="Nutrition Tip"
              detail="Calcium focus today"
              color="#E07B00"
            />
            <TaskCard
              icon="bulb-outline"
              label="Growth Insight"
              detail="AI tip snippet"
              glow="purple"
            />
          </View>
        </Animated.View>

        {/* E. Weekly Growth Sparkline */}
        <Animated.View entering={FadeInDown.delay(340).duration(400)}>
          <Text style={s.sectionTitle}>This Week</Text>
          <GlowCard glow="green" compact style={s.sparkCard}>
            <WeeklySparkline logs={(monthLogs ?? []).slice(0, 7)} />
          </GlowCard>
        </Animated.View>
      </ScrollView>

      {/* F. Quick Log FAB */}
      <Pressable
        onPress={() => router.push('/detail/log-height')}
        style={[s.fab, glowShadow(dark.glowGreen, 0.35)]}
      >
        <Ionicons name="add" size={28} color="#000" />
      </Pressable>
    </View>
  )
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ name, initials }: { name: string; initials: string }) {
  return (
    <View style={s.header}>
      <View>
        <Text style={s.greeting}>Good morning, {name}</Text>
        <Text style={s.greetingSub}>Ready to grow?</Text>
      </View>
      <View style={s.headerRight}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Pressable style={s.notifBtn}>
          <Ionicons name="notifications-outline" size={20} color={dark.textSecond} />
        </Pressable>
      </View>
    </View>
  )
}

// ─── Streak Strip ──────────────────────────────────────────────────────────

function StreakStrip({ streakDays }: { streakDays: number }) {
  const weekProgress = Math.min(streakDays, 7)

  return (
    <View style={s.streakWrap}>
      <View style={s.streakRow}>
        {WEEKDAYS.map((day, idx) => {
          const isToday = idx === todayIndex
          const isFilled = idx < weekProgress
          const isMissed = idx === weekProgress - 1 && idx < todayIndex
          return (
            <View key={day} style={s.streakItem}>
              <View
                style={[
                  s.streakDot,
                  isToday && { backgroundColor: dark.glowGreen, ...glowShadow(dark.glowGreen, 0.5) },
                  isFilled && !isToday && { backgroundColor: 'rgba(0,255,135,0.3)', borderColor: dark.glowGreen },
                  isMissed && { backgroundColor: 'rgba(255,61,90,0.2)', borderColor: dark.glowRed },
                ]}
              />
              <Text style={[s.streakLabel, isToday && { color: dark.glowGreen }]}>{day}</Text>
            </View>
          )
        })}
      </View>
      <Text style={s.streakText}>🔥 {streakDays}-day streak</Text>
    </View>
  )
}

// ─── Task Card ─────────────────────────────────────────────────────────────

function TaskCard({
  icon,
  label,
  detail,
  progress,
  glow,
  color,
}: {
  icon: string
  label: string
  detail: string
  progress?: number
  glow?: 'green' | 'blue' | 'purple'
  color?: string
}) {
  const accent = glow
    ? ({ green: dark.glowGreen, blue: dark.glowBlue, purple: dark.glowPurple } as const)[glow]
    : color ?? dark.textSecond

  return (
    <Pressable style={[s.taskCard, { borderColor: dark.bgBorder }]}>
      <View style={[s.taskIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon as any} size={20} color={accent} />
      </View>
      <Text style={s.taskLabel}>{label}</Text>
      <Text style={[s.taskDetail, { color: accent }]}>{detail}</Text>
      {progress !== undefined && (
        <View style={s.progressTrack}>
          <View style={[s.progressBar, { width: `${progress * 100}%`, backgroundColor: accent }]} />
        </View>
      )}
    </Pressable>
  )
}

// ─── Weekly Sparkline ──────────────────────────────────────────────────────

import type { HeightLog } from '@/lib/types'

function WeeklySparkline({ logs }: { logs: HeightLog[] }) {
  const SPARK_W = 280
  const SPARK_H = 60

  if (logs.length < 2) {
    return (
      <View style={[sp.inner, { height: SPARK_H, justifyContent: 'center' }]}>
        <Text style={{ color: dark.textMuted, fontSize: 12, fontFamily: Fonts.regular }}>
          Not enough data
        </Text>
      </View>
    )
  }

  const sorted = [...logs].sort((a, b) => a.logged_date.localeCompare(b.logged_date))
  const values = sorted.map((l) => l.height_cm)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * SPARK_W
      const y = SPARK_H - ((v - min) / range) * SPARK_H
      return `${x},${y}`
    })
    .join(' ')

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const labelCount = Math.min(values.length, 7)

  return (
    <View style={sp.inner}>
      <Svg width={SPARK_W} height={SPARK_H}>
        <Polyline points={points} fill="none" stroke={dark.glowGreen} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      </Svg>
      <View style={sp.labels}>
        {dayLabels.slice(0, labelCount).map((d, i) => (
          <Text key={i} style={sp.label}>{d}</Text>
        ))}
      </View>
    </View>
  )
}

const sp = StyleSheet.create({
  inner: { alignItems: 'center' },
  labels: { flexDirection: 'row', justifyContent: 'space-between', width: 280, marginTop: 4 },
  label: { fontSize: 9, fontFamily: Fonts.mono, color: dark.textMuted },
})

// ─── Styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { fontSize: 16, fontFamily: Fonts.medium, color: dark.textSecond },
  greetingSub: { fontSize: 12, color: dark.textMuted, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: dark.glowGreen, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontFamily: Fonts.bold, color: '#000' },
  notifBtn: {
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: dark.bgSurface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: dark.bgBorder,
  },

  // Hero card
  heroCard: { padding: 20 },
  heroInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft: { gap: 4, flex: 1 },
  heroLabel: { fontSize: 12, color: dark.textSecond, fontFamily: Fonts.medium },
  heroValue: { fontFamily: Fonts.display, fontSize: 40, color: dark.textPrimary, lineHeight: 44 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, backgroundColor: dark.glowGreen,
  },
  heroBadgeText: { fontSize: 11, fontFamily: Fonts.bold, color: '#000' },

  // Streak
  streakWrap: { gap: 8 },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between' },
  streakItem: { alignItems: 'center', gap: 6 },
  streakDot: {
    width: 36, height: 36, borderRadius: 999,
    borderWidth: 1, borderColor: dark.bgMuted, backgroundColor: dark.bgSurface,
  },
  streakLabel: { fontSize: 10, color: dark.textMuted, fontFamily: Fonts.medium },
  streakText: { fontSize: 13, fontFamily: Fonts.semibold, color: dark.textSecond, textAlign: 'center' },

  sectionTitle: {
    fontSize: 14, fontFamily: Fonts.bold, color: dark.textPrimary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Task grid
  taskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  taskCard: {
    width: '47%', backgroundColor: dark.bgSurface,
    borderRadius: 16, borderWidth: 1, padding: 14, gap: 6,
  },
  taskIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  taskLabel: { fontSize: 13, fontFamily: Fonts.semibold, color: dark.textPrimary },
  taskDetail: { fontSize: 11, fontFamily: Fonts.medium },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: dark.bgBorder, marginTop: 4 },
  progressBar: { height: 4, borderRadius: 2 },

  // Sparkline
  sparkCard: { paddingVertical: 12, paddingHorizontal: 16 },

  // FAB
  fab: {
    position: 'absolute', bottom: TAB_BAR_CLEARANCE + 16, right: 20,
    width: 56, height: 56, borderRadius: 999,
    backgroundColor: dark.glowGreen,
    alignItems: 'center', justifyContent: 'center',
  },
})
