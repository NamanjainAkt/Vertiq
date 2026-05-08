import { useState, useMemo } from 'react'
import { View, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Svg, { Polyline, Polygon, Line, Defs, LinearGradient, Stop } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useHeightLogs, useHeightLogsRange, useLatestHeight } from '@/hooks/useHeightLogs'

const SCREEN_WIDTH = Dimensions.get('window').width
const CHART_W = SCREEN_WIDTH - 40
const CHART_H = 220
const PAD = { top: 16, bottom: 20, left: 32, right: 8 }
const PLOT_W = CHART_W - PAD.left - PAD.right
const PLOT_H = CHART_H - PAD.top - PAD.bottom

const RANGES = ['1M', '3M', '6M', '1Y', 'All'] as const
const RANGE_DAYS: Record<string, number | null> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  'All': null,
}

export default function MeasurementsScreen() {
  const insets = useSafeAreaInsets()
  const [activeRange, setActiveRange] = useState('3M')

  const { data: latest } = useLatestHeight()
  const { data: allLogs } = useHeightLogs()
  const rangeDays = RANGE_DAYS[activeRange]
  const { data: rangeLogs } = useHeightLogsRange(rangeDays ?? 365)

  const sorted = useMemo(
    () => [...(rangeLogs ?? [])].sort((a, b) => a.logged_date.localeCompare(b.logged_date)),
    [rangeLogs]
  )

  const currentCm = latest?.height_cm ?? 171.2

  const stats = useMemo(() => {
    if (sorted.length < 2) {
      return { totalGain: 0, avgMonthly: 0, bestMonth: 0 }
    }
    const first = sorted[0].height_cm
    const last = sorted[sorted.length - 1].height_cm
    const totalGain = Math.round((last - first) * 10) / 10

    // Compute monthly gain from oldest entry
    const monthsDiff = Math.max(
      1,
      (new Date(sorted[sorted.length - 1].logged_date).getTime() -
        new Date(sorted[0].logged_date).getTime()) /
        (30 * 24 * 60 * 60 * 1000)
    )
    const avgMonthly = Math.round((totalGain / monthsDiff) * 100) / 100

    // Best month: split by month, find max gain
    const byMonth: Record<string, number[]> = {}
    sorted.forEach((l) => {
      const monthKey = l.logged_date.slice(0, 7)
      if (!byMonth[monthKey]) byMonth[monthKey] = []
      byMonth[monthKey].push(l.height_cm)
    })
    let bestMonth = 0
    Object.values(byMonth).forEach((vals) => {
      if (vals.length >= 2) {
        const gain = Math.round((vals[vals.length - 1] - vals[0]) * 10) / 10
        if (gain > bestMonth) bestMonth = gain
      }
    })

    return { totalGain, avgMonthly, bestMonth }
  }, [sorted])

  // Chart dimensions
  const minCm = useMemo(() => {
    const all = sorted.map((l) => l.height_cm)
    return all.length ? Math.floor(Math.min(...all)) - 1 : 167
  }, [sorted])
  const maxCm = useMemo(() => {
    const all = sorted.map((l) => l.height_cm)
    return all.length ? Math.ceil(Math.max(...all)) + 1 : 173
  }, [sorted])

  const yTicks = useMemo(() => {
    const step = Math.max(1, Math.round((maxCm - minCm) / 6))
    const ticks: number[] = []
    for (let v = minCm; v <= maxCm; v += step) {
      ticks.push(v)
    }
    return ticks
  }, [minCm, maxCm])

  function px(idx: number, total: number): number {
    return PAD.left + (idx / Math.max(total - 1, 1)) * PLOT_W
  }

  function py(cm: number): number {
    return PAD.top + (1 - (cm - minCm) / Math.max(maxCm - minCm, 1)) * PLOT_H
  }

  // Build x-axis labels (only show a few)
  const xLabels = useMemo(() => {
    if (sorted.length <= 7) {
      return sorted.map((l) => ({
        label: l.logged_date.slice(5),
        idx: sorted.indexOf(l),
      }))
    }
    const step = Math.max(1, Math.floor(sorted.length / 5))
    return sorted
      .filter((_, i) => i % step === 0 || i === sorted.length - 1)
      .map((l) => ({
        label: l.logged_date.slice(5),
        idx: sorted.indexOf(l),
      }))
  }, [sorted])

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* A. Height Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)}>
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <Text style={s.headerLabel}>Current Height</Text>
              <Text style={s.headerValue}>{currentCm.toFixed(1)} cm</Text>
              {stats.totalGain > 0 && (
                <View style={s.headerBadge}>
                  <Ionicons name="trending-up" size={12} color="#000" />
                  <Text style={s.headerBadgeText}>+{stats.totalGain.toFixed(1)} cm total</Text>
                </View>
              )}
            </View>
            <Pressable
              style={s.logBtn}
              onPress={() => router.push('/detail/log-height')}
            >
              <Ionicons name="add" size={16} color={dark.glowGreen} />
              <Text style={s.logBtnText}>Log Height</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* B. Time Range Selector */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <View style={s.rangeRow}>
            {RANGES.map((r) => {
              const isActive = r === activeRange
              return (
                <Pressable
                  key={r}
                  onPress={() => setActiveRange(r)}
                  style={[s.rangeChip, isActive ? s.rangeChipActive : s.rangeChipInactive]}
                >
                  <Text style={[s.rangeLabel, isActive && s.rangeLabelActive]}>{r}</Text>
                </Pressable>
              )
            })}
          </View>
        </Animated.View>

        {/* C. Main Growth Chart */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <GlowCard glow="green" style={s.chartCard}>
            {sorted.length >= 2 ? (
              <>
                <View style={s.chartArea}>
                  <View style={s.chartInner}>
                    <Svg width={CHART_W} height={CHART_H}>
                      <Defs>
                        <LinearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={dark.glowGreen} stopOpacity="0.25" />
                          <Stop offset="1" stopColor={dark.glowGreen} stopOpacity="0" />
                        </LinearGradient>
                      </Defs>
                      {yTicks.map((tick) => (
                        <Line
                          key={tick}
                          x1={PAD.left}
                          y1={py(tick)}
                          x2={CHART_W - PAD.right}
                          y2={py(tick)}
                          stroke={dark.bgBorder}
                          strokeWidth={1}
                        />
                      ))}
                      <Polygon points={sorted.map((d, i) => `${px(i, sorted.length)},${py(d.height_cm)}`).join(' ')} fill="url(#greenFill)" />
                      <Polyline
                        points={sorted.map((d, i) => `${px(i, sorted.length)},${py(d.height_cm)}`).join(' ')}
                        fill="none"
                        stroke={dark.glowGreen}
                        strokeWidth={3}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </Svg>
                    <View style={s.yAxisOverlay}>
                      {yTicks.map((tick) => (
                        <Text key={tick} style={[s.yLabel, { top: py(tick) - 7 }]}>{tick}</Text>
                      ))}
                    </View>
                  </View>
                  <View style={s.xAxisRow}>
                    {xLabels.map((m) => (
                      <Text key={m.idx} style={[s.xLabel, { left: px(m.idx, sorted.length) - 14 }]}>{m.label}</Text>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <View style={{ height: CHART_H, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: dark.textMuted, fontSize: 14, fontFamily: Fonts.regular }}>
                  Log your first height measurement
                </Text>
              </View>
            )}
          </GlowCard>
        </Animated.View>

        {/* D. Stats Row */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <View style={s.statsRow}>
            <StatBlock value={`${stats.avgMonthly.toFixed(2)} cm`} label="Avg monthly gain" />
            <StatBlock value={`${stats.bestMonth.toFixed(1)} cm`} label="Best month" />
            <StatBlock value={`${stats.totalGain.toFixed(1)} cm`} label="Total gain" />
          </View>
        </Animated.View>

        {/* E. Entry Log List */}
        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <Text style={s.sectionTitle}>Recent Entries</Text>
          <View style={s.entryList}>
            {(allLogs ?? []).slice(0, 10).map((entry) => {
              const date = new Date(entry.logged_date)
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              return (
                <View key={entry.id} style={s.entryRow}>
                  <View style={s.entryDot} />
                  <Text style={s.entryDate}>{dateStr}</Text>
                  <Text style={s.entryHeight}>{entry.height_cm.toFixed(1)} cm</Text>
                </View>
              )
            })}
            {(allLogs ?? []).length === 0 && (
              <View style={s.entryRow}>
                <Text style={{ color: dark.textMuted, fontSize: 13 }}>No entries yet</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.statBlock}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { paddingHorizontal: 20, gap: 20 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerLeft: { gap: 4 },
  headerLabel: { fontSize: 12, fontFamily: Fonts.medium, color: dark.textSecond },
  headerValue: { fontFamily: Fonts.display, fontSize: 56, lineHeight: 62, color: dark.glowGreen },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, backgroundColor: dark.glowGreen,
  },
  headerBadgeText: { fontSize: 11, fontFamily: Fonts.bold, color: '#000' },
  logBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: dark.glowGreen,
  },
  logBtnText: { fontSize: 13, fontFamily: Fonts.semibold, color: dark.glowGreen },
  rangeRow: { flexDirection: 'row', gap: 8 },
  rangeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  rangeChipActive: { backgroundColor: dark.glowGreen },
  rangeChipInactive: { backgroundColor: dark.bgBorder },
  rangeLabel: { fontSize: 12, fontFamily: Fonts.semibold, color: dark.textSecond },
  rangeLabelActive: { color: '#000' },
  chartCard: { padding: 12 },
  chartArea: {},
  chartInner: { position: 'relative' },
  yAxisOverlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  yLabel: {
    position: 'absolute', left: 2,
    fontFamily: Fonts.mono, fontSize: 11, color: dark.textMuted,
  },
  xAxisRow: { position: 'relative', height: 18, marginTop: 2 },
  xLabel: {
    position: 'absolute', top: 0,
    fontFamily: Fonts.mono, fontSize: 11, color: dark.textMuted,
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBlock: {
    flex: 1, backgroundColor: dark.bgSurface, borderRadius: 16,
    borderWidth: 1, borderColor: dark.bgBorder,
    padding: 14, alignItems: 'center', gap: 4,
  },
  statValue: { fontFamily: Fonts.mono, fontSize: 20, lineHeight: 26, color: dark.textPrimary },
  statLabel: { fontSize: 11, fontFamily: Fonts.regular, color: dark.textSecond, textAlign: 'center' },
  sectionTitle: {
    fontSize: 14, fontFamily: Fonts.bold, color: dark.textPrimary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  entryList: {
    backgroundColor: dark.bgSurface, borderRadius: 16, borderWidth: 1, borderColor: dark.bgBorder,
    overflow: 'hidden',
  },
  entryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark.bgBorder,
  },
  entryDot: {
    width: 8, height: 8, borderRadius: 999,
    backgroundColor: dark.glowGreen, ...glowShadow(dark.glowGreen, 0.5),
  },
  entryDate: { fontSize: 13, fontFamily: Fonts.regular, color: dark.textSecond, flex: 1 },
  entryHeight: { fontFamily: Fonts.mono, fontSize: 15, color: dark.textPrimary },
})
