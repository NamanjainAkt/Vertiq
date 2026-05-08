import { useState, useMemo } from 'react'
import { View, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Svg, { Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { ProgressRing } from '@/components/ProgressRing'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useLastSleep, useSleepLogsRange, useLogSleep } from '@/hooks/useSleepLogs'
import { useStreak } from '@/hooks/useStreaks'

const EMOJIS = ['😴', '😪', '😐', '😊', '🌟']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_HOURS = 10
const CHART_W = 300
const CHART_H = 140
const REFERENCE_HOUR = 8
const AREA = CHART_W / 7
const BAR_W = AREA * 0.55
const REF_Y = CHART_H - (REFERENCE_HOUR / MAX_HOURS) * CHART_H

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m`
}

function computeQualityScore(durationMin: number): number {
  if (durationMin >= 540) return 5  // 9h+
  if (durationMin >= 480) return 4  // 8h+
  if (durationMin >= 420) return 3  // 7h+
  if (durationMin >= 360) return 2  // 6h+
  return 1
}

export default function SleepScreen() {
  const insets = useSafeAreaInsets()
  const { data: lastSleep } = useLastSleep()
  const { data: weekLogs } = useSleepLogsRange(7)
  const { data: sleepStreak } = useStreak('sleep')
  const logSleep = useLogSleep()

  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null)
  const [notes, setNotes] = useState('')

  const qualityScore = lastSleep?.quality_score ?? computeQualityScore(lastSleep?.duration_min ?? 420)
  const qualityPct = ((qualityScore - 1) / 4) * 100

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* A. Sleep Score Hero */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={s.heroWrap}>
            <ProgressRing
              progress={qualityPct}
              size={160}
              strokeWidth={12}
              color={dark.glowBlue}
              centerValue={lastSleep ? `${Math.floor(lastSleep.duration_min / 60)}h` : '--'}
              centerLabel={lastSleep ? `${lastSleep.duration_min % 60}m` : 'No data'}
            />
            <Text style={s.heroCaption}>
              {lastSleep ? (qualityScore >= 4 ? 'Great recovery' : qualityScore >= 3 ? 'Decent sleep' : 'Needs improvement') : 'Log your sleep'}
            </Text>
          </View>
        </Animated.View>

        {/* B. Last Night Summary */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)}>
          <GlowCard glow="blue" compact style={s.summaryCard}>
            <View style={s.summaryRow}>
              <SummaryItem label="Bedtime" value={lastSleep ? formatTime(lastSleep.bedtime) : '--'} />
              <SummaryItem label="Wake" value={lastSleep ? formatTime(lastSleep.wake_time) : '--'} />
              <SummaryItem label="Duration" value={lastSleep ? formatDuration(lastSleep.duration_min) : '--'} accent />
            </View>
          </GlowCard>
        </Animated.View>

        {/* C. 7-Day Sleep Bar Chart */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)}>
          <Text style={s.sectionTitle}>This Week</Text>
          <GlowCard glow="blue" compact style={s.chartCard}>
            <SleepChart weekLogs={weekLogs ?? []} />
          </GlowCard>
        </Animated.View>

        {/* D. Sleep Quality Log */}
        <Animated.View entering={FadeInDown.delay(340).duration(400)}>
          <Text style={s.sectionTitle}>Log Sleep</Text>
          <GlowCard glow="blue" compact style={s.logCard}>
            <Text style={s.logLabel}>How was your sleep?</Text>
            <View style={s.emojiRow}>
              {EMOJIS.map((emoji, i) => (
                <Pressable
                  key={i}
                  onPress={() => setSelectedEmoji(i)}
                  style={[
                    s.emojiBtn,
                    selectedEmoji === i && { backgroundColor: `${dark.glowBlue}20`, borderColor: dark.glowBlue },
                  ]}
                >
                  <Text style={s.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={s.notesInput}
              placeholder="Notes (optional)"
              placeholderTextColor={dark.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <Pressable
              style={[s.logBtn, glowShadow(dark.glowBlue, 0.35)]}
              onPress={() => {
                const now = new Date()
                const today = now.toISOString().slice(0, 10)
                // Default to 10pm - 6am if no data
                logSleep.mutate({
                  bedtime: '22:00',
                  wake_time: '06:00',
                  duration_min: 480,
                  quality_score: (selectedEmoji ?? 2) + 1 as 1 | 2 | 3 | 4 | 5,
                  logged_date: today,
                  notes: notes || undefined,
                })
                setSelectedEmoji(null)
                setNotes('')
              }}
            >
              <Text style={s.logBtnText}>Log Sleep</Text>
            </Pressable>
          </GlowCard>
        </Animated.View>

        {/* E. Growth Hormone Insight Card */}
        <Animated.View entering={FadeInDown.delay(420).duration(400)}>
          <GlowCard glow="purple" style={s.insightCard}>
            <Text style={s.insightTitle}>Growth Hormone Insight</Text>
            <Text style={s.insightBody}>
              Deep sleep triggers the largest natural release of growth hormone. Prioritizing 7-9 hours of quality
              sleep can significantly boost your HGH production.
            </Text>
          </GlowCard>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

// ─── Summary Item ────────────────────────────────────────────────────────

function SummaryItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.summaryItem}>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={[s.summaryValue, accent && { color: dark.glowBlue }]}>{value}</Text>
    </View>
  )
}

// ─── Sleep Chart ─────────────────────────────────────────────────────────

import type { SleepLog } from '@/lib/types'

function SleepChart({ weekLogs }: { weekLogs: SleepLog[] }) {
  const hoursByDay = useMemo(() => {
    const map: Record<number, number> = {}
    weekLogs.forEach((log) => {
      const day = new Date(log.logged_date).getDay()
      const idx = day === 0 ? 6 : day - 1
      map[idx] = log.duration_min / 60
    })
    return map
  }, [weekLogs])

  const sleepData = DAYS.map((_, i) => hoursByDay[i] ?? 0)

  return (
    <View style={s.chartInner}>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={dark.glowBlue} stopOpacity="0.9" />
            <Stop offset="1" stopColor={dark.glowBlue} stopOpacity="0.35" />
          </LinearGradient>
          <LinearGradient id="barGradLow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={dark.glowRed} stopOpacity="0.9" />
            <Stop offset="1" stopColor={dark.glowRed} stopOpacity="0.35" />
          </LinearGradient>
        </Defs>
        {sleepData.map((hours, i) => {
          const barH = (hours / MAX_HOURS) * CHART_H
          const barX = AREA * i + (AREA - BAR_W) / 2
          const barY = CHART_H - barH
          const isLow = hours > 0 && hours < 6
          return (
            <Rect
              key={i}
              x={barX}
              y={barY}
              width={BAR_W}
              height={barH || 2}
              rx={4}
              fill={isLow ? 'url(#barGradLow)' : 'url(#barGrad)'}
              opacity={hours > 0 ? 1 : 0.15}
            />
          )
        })}
        <Line
          x1={0} y1={REF_Y} x2={CHART_W} y2={REF_Y}
          stroke={dark.glowBlue} strokeWidth={1} strokeDasharray="4,4" opacity={0.5}
        />
      </Svg>
      <View style={s.xAxis}>
        {DAYS.map((d, i) => (
          <Text key={d} style={s.xLabel}>{d}</Text>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { paddingHorizontal: 20, gap: 16 },
  heroWrap: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  heroCaption: { fontSize: 14, fontFamily: Fonts.medium, color: dark.textSecond },
  summaryCard: { paddingVertical: 14 },
  summaryRow: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryLabel: { fontSize: 10, color: dark.textMuted, fontFamily: Fonts.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 16, fontFamily: Fonts.mono, color: dark.textPrimary },
  sectionTitle: {
    fontSize: 14, fontFamily: Fonts.bold, color: dark.textPrimary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  chartCard: { paddingVertical: 14, paddingHorizontal: 12 },
  chartInner: { alignItems: 'center' },
  xAxis: { flexDirection: 'row', width: CHART_W, marginTop: 6 },
  xLabel: { width: AREA, textAlign: 'center', fontSize: 9, fontFamily: Fonts.mono, color: dark.textMuted },
  logCard: { gap: 14 },
  logLabel: { fontSize: 13, fontFamily: Fonts.semibold, color: dark.textSecond },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  emojiBtn: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: dark.bgBorder, borderWidth: 1, borderColor: 'transparent',
  },
  emojiText: { fontSize: 22 },
  notesInput: {
    backgroundColor: dark.bgBorder, borderRadius: 12, padding: 12,
    color: dark.textPrimary, fontFamily: Fonts.regular, fontSize: 13,
    minHeight: 72, textAlignVertical: 'top',
  },
  logBtn: {
    backgroundColor: dark.glowBlue, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  logBtnText: { fontSize: 15, fontFamily: Fonts.bold, color: '#000' },
  insightCard: { gap: 8 },
  insightTitle: { fontSize: 15, fontFamily: Fonts.semibold, color: dark.textPrimary },
  insightBody: { fontSize: 13, fontFamily: Fonts.regular, color: dark.textSecond, lineHeight: 20 },
})
