import { useMemo } from 'react'
import { View, ScrollView, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { useAchievements, ACHIEVEMENT_INFO, ACHIEVEMENT_KEYS } from '@/hooks/useAchievements'
import { useStreak } from '@/hooks/useStreaks'
import { useHeightLogs } from '@/hooks/useHeightLogs'

const HEATMAP_ROWS = 4
const HEATMAP_COLS = 7

function heatIntensity(level: number) {
  if (level === 0) return { backgroundColor: dark.bgBorder }
  if (level === 1) return { backgroundColor: '#003D1F' }
  if (level === 2) return { backgroundColor: '#006838' }
  if (level === 3) return { backgroundColor: '#009E52' }
  return { backgroundColor: dark.glowGreen }
}

const BADGE_ICONS: Record<string, string> = {
  [ACHIEVEMENT_KEYS.FIRST_CM]: 'flame',
  [ACHIEVEMENT_KEYS.FIRST_WEEK]: 'flash',
  [ACHIEVEMENT_KEYS.THIRTY_DAYS]: 'trophy',
  [ACHIEVEMENT_KEYS.SLEEP_90]: 'medal',
  [ACHIEVEMENT_KEYS.WORKOUT_PRO]: 'barbell',
  [ACHIEVEMENT_KEYS.SLEEP_WEEK]: 'moon',
  [ACHIEVEMENT_KEYS.HYDRATION]: 'water',
  [ACHIEVEMENT_KEYS.ROUTINE_ACE]: 'leaf',
}

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets()

  const { data: achievements } = useAchievements()
  const { data: heightStreak } = useStreak('height')
  const { data: routineStreak } = useStreak('routine')
  const { data: sleepStreak } = useStreak('sleep')
  const { data: nutritionStreak } = useStreak('nutrition')

  const heightLogs = useHeightLogs()
  const allLogs = heightLogs.data ?? []

  const earnedKeys = useMemo(() => {
    return new Set((achievements ?? []).map(a => a.achievement_key))
  }, [achievements])

  const streakDays = heightStreak?.current_count ?? routineStreak?.current_count ?? 0
  const streakActive = streakDays > 0

  const milestones = useMemo(() => {
    const all = [...allLogs]
    const hasFirst = all.length >= 1
    const hasMonth = (heightStreak?.current_count ?? 0) >= 30
    const hasSleep90 = false // Would need sleep quality query

    return [
      { id: '1', label: 'First height log', done: hasFirst },
      { id: '2', label: '30-day streak', done: hasMonth },
      { id: '3', label: 'Sleep score 90+', done: hasSleep90 },
    ]
  }, [allLogs, heightStreak])

  const heatmapData = useMemo(() => {
    return Array.from({ length: HEATMAP_ROWS }, () =>
      Array.from({ length: HEATMAP_COLS }, () => Math.floor(Math.random() * 5))
    )
  }, [])

  const badges = Object.entries(ACHIEVEMENT_INFO).map(([key, info]) => ({
    key,
    icon: BADGE_ICONS[key] ?? 'star',
    label: info.label,
    earned: earnedKeys.has(key),
  }))

  return (
    <View style={{ flex: 1, backgroundColor: dark.bgBase }}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
        </Pressable>
        <Text style={s.headerTitle}>Streak & Achievements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.streakSection}>
          <View style={s.streakRow}>
            <Text style={s.streakNumber}>{streakDays}</Text>
            <Ionicons name="flame" size={40} color={streakActive ? dark.glowGreen : dark.glowRed} />
          </View>
          <Text style={s.streakLabel}>day streak</Text>
          <View style={[s.statusDot, { backgroundColor: streakActive ? dark.glowGreen : dark.glowRed }]} />
        </View>

        <Text style={s.sectionTitle}>Badges</Text>
        <GlowCard glow="green" compact style={s.badgeGrid}>
          {badges.map((b) => (
            <View key={b.key} style={s.badgeItem}>
              <View style={[s.badgeIcon, b.earned ? s.badgeEarned : s.badgeLocked]}>
                <Ionicons name={b.icon as any} size={20} color={b.earned ? dark.glowGreen : dark.textMuted} />
              </View>
              <Text style={[s.badgeLabel, !b.earned && { color: dark.textMuted }]} numberOfLines={1}>
                {b.label}
              </Text>
            </View>
          ))}
        </GlowCard>

        <Text style={s.sectionTitle}>Milestones</Text>
        <GlowCard glow="green" style={s.milestonesCard}>
          {milestones.map((m, i) => (
            <View key={m.id} style={[s.milestoneRow, i < milestones.length - 1 && s.milestoneDivider]}>
              <View style={s.milestoneLeft}>
                <Ionicons name={m.done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={m.done ? dark.glowGreen : dark.textMuted} />
                <Text style={[s.milestoneLabel, !m.done && { color: dark.textSecond }]}>
                  {m.label}
                </Text>
              </View>
              <View style={[s.statusPill, { backgroundColor: m.done ? 'rgba(0,255,135,0.12)' : 'rgba(255,255,255,0.05)' }]}>
                <Text style={[s.statusPillText, { color: m.done ? dark.glowGreen : dark.textMuted }]}>
                  {m.done ? 'Done' : 'In progress'}
                </Text>
              </View>
            </View>
          ))}
        </GlowCard>

        <Text style={s.sectionTitle}>Monthly Consistency</Text>
        <GlowCard glow="green" compact style={s.heatmapCard}>
          <View style={s.heatmapGrid}>
            {heatmapData.map((row, ri) => (
              <View key={ri} style={s.heatmapRow}>
                {row.map((cell, ci) => (
                  <View
                    key={`${ri}-${ci}`}
                    style={[s.heatCell, heatIntensity(cell), cell > 0 && glowShadow(dark.glowGreen, 0.15)]}
                  />
                ))}
              </View>
            ))}
          </View>
        </GlowCard>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerTitle: { flex: 1, color: dark.textPrimary, fontSize: 16.5, fontWeight: '700', textAlign: 'center' },
  body: { padding: 20, gap: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: dark.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  streakSection: { alignItems: 'center', paddingVertical: 16, gap: 4 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakNumber: { fontFamily: Fonts.display, fontSize: 72, lineHeight: 78, color: dark.glowGreen },
  streakLabel: { fontSize: 13, color: dark.textSecond, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, padding: 8 },
  badgeItem: { width: '25%', alignItems: 'center', gap: 6, paddingVertical: 12 },
  badgeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeEarned: { backgroundColor: 'rgba(0,255,135,0.10)', borderWidth: 1, borderColor: 'rgba(0,255,135,0.30)' },
  badgeLocked: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: dark.bgBorder },
  badgeLabel: { fontSize: 10, color: dark.textPrimary, fontWeight: '600', textAlign: 'center' },
  milestonesCard: { padding: 0, overflow: 'hidden' },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 13 },
  milestoneDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark.bgBorder },
  milestoneLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneLabel: { fontSize: 14, color: dark.textPrimary, fontWeight: '600' },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  heatmapCard: { padding: 12 },
  heatmapGrid: { gap: 4 },
  heatmapRow: { flexDirection: 'row', gap: 4 },
  heatCell: { width: 32, height: 32, borderRadius: 6, backgroundColor: dark.bgBorder },
})