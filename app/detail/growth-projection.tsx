import { useMemo } from 'react'
import { View, ScrollView, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Polyline, Polygon, Line, Defs, LinearGradient, Stop } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { useLatestHeight, useHeightLogsRange } from '@/hooks/useHeightLogs'
import { useProfile } from '@/hooks/useProfile'

const CHART_W = 320
const CHART_H = 180
const PAD = { t: 20, r: 16, b: 28, l: 36 }
const DW = CHART_W - PAD.l - PAD.r
const DH = CHART_H - PAD.t - PAD.b
const YMIN = 135
const YMAX = 195
const YR = YMAX - YMIN

function x(i: number, total: number) { return PAD.l + (i / Math.max(total - 1, 1)) * DW }
function y(h: number) { return PAD.t + DH - ((h - YMIN) / YR) * DH }

export default function GrowthProjectionScreen() {
  const insets = useSafeAreaInsets()
  const { data: profile } = useProfile()
  const { data: latestHeight } = useLatestHeight()
  const { data: logs } = useHeightLogsRange(365)

  const currentCm = latestHeight?.height_cm ?? 170

  const projection = useMemo(() => {
    if (!logs || logs.length < 2) {
      return { final: 180, factors: [
        { label: 'Genetics', pct: 70 },
        { label: 'Sleep', pct: 10 },
        { label: 'Nutrition', pct: 10 },
        { label: 'Exercise', pct: 10 },
      ]}
    }

    const sorted = [...logs].sort((a, b) => a.logged_date.localeCompare(b.logged_date))
    const first = sorted[0].height_cm
    const last = sorted[sorted.length - 1].height_cm

    const months = Math.max(1, (new Date(sorted[sorted.length - 1].logged_date).getTime() - new Date(sorted[0].logged_date).getTime()) / (30 * 24 * 60 * 60 * 1000))
    const monthlyGain = (last - first) / months

    const currentAge = profile?.age ?? 16
    const yearsTo21 = Math.max(0, 21 - currentAge)
    const projectedFinal = Math.round(last + (monthlyGain * yearsTo21 * 12))

    const factors = [
      { label: 'Genetics', pct: 60 },
      { label: 'Sleep', pct: 15 },
      { label: 'Nutrition', pct: 15 },
      { label: 'Exercise', pct: 10 },
    ]

    return { final: Math.min(projectedFinal, 195), factors }
  }, [logs, profile])

  const ageLabels = Array.from({ length: 10 }, (_, i) => 12 + i)
  const actualCount = Math.min(5, logs?.length ?? 5)

  const actualPoints = useMemo(() => {
    if (!logs || logs.length < 2) return [145, 152, 160, 167, currentCm]
    return logs.slice(-5).map(l => l.height_cm)
  }, [logs, currentCm])

  const projectedPoints = useMemo(() => {
    const base = actualPoints[actualPoints.length - 1]
    if (!base) return [173, 175, 177, 179, 181, 183]
    return Array.from({ length: 6 }, (_, i) => Math.round(base + i * 0.8))
  }, [actualPoints])

  const upperBand = useMemo(() => projectedPoints.map((h, i) => h + 3), [projectedPoints])
  const lowerBand = useMemo(() => projectedPoints.map((h, i) => h - 2), [projectedPoints])

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={dark.textSecond} />
          </Pressable>
        </View>
        <Text style={s.title}>Your Growth Projection</Text>

        <GlowCard glow="purple" style={s.chartCard}>
          <Chart
            actual={actualPoints}
            projected={projectedPoints}
            upperBand={upperBand}
            lowerBand={lowerBand}
            ageLabels={ageLabels}
          />
        </GlowCard>

        <View style={s.finalWrap}>
          <Text style={s.finalLabel}>Projected final height</Text>
          <Text style={s.finalValue}>{projection.final} cm</Text>
          <Text style={s.finalSub}>by age 21</Text>
        </View>

        <GlowCard glow="purple" style={s.factorsCard}>
          <Text style={s.factorsTitle}>Growth Factors</Text>
          {projection.factors.map((f) => (
            <View key={f.label} style={s.factorRow}>
              <View style={s.factorLabelRow}>
                <Text style={s.factorLabel}>{f.label}</Text>
                <Text style={s.factorPct}>{f.pct}%</Text>
              </View>
              <View style={s.factorTrack}>
                <View style={[s.factorBar, { width: `${f.pct}%` }]} />
              </View>
            </View>
          ))}
        </GlowCard>

        <Pressable
          onPress={() => router.push('/(tabs)/routine')}
          style={[s.cta, glowShadow(dark.glowPurple, 0.4)]}
        >
          <Ionicons name="trending-up-outline" size={18} color="#000" />
          <Text style={s.ctaText}>Improve your projection</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

function Chart({
  actual,
  projected,
  upperBand,
  lowerBand,
  ageLabels,
}: {
  actual: number[]
  projected: number[]
  upperBand: number[]
  lowerBand: number[]
  ageLabels: number[]
}) {
  const yLabels = [140, 155, 170, 185]
  const xLabels = ageLabels.filter((_, i) => i % 2 === 0)

  const total = actual.length + projected.length
  const curIdx = actual.length - 1

  const actualPoints = actual.map((h, i) => `${x(i, total)},${y(h)}`).join(' ')
  const projectedPoints = projected.map((h, i) => `${x(curIdx + i, total)},${y(h)}`).join(' ')
  const bandTop = upperBand.map((h, i) => `${x(curIdx + i, total)},${y(h)}`).join(' ')
  const bandBottom = lowerBand.map((h, i) => `${x(curIdx + i, total)},${y(h)}`).reverse().join(' ')
  const bandPoints = `${bandTop} ${bandBottom}`

  return (
    <View style={s.chartWrap}>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={dark.glowPurple} stopOpacity="0.3" />
            <Stop offset="1" stopColor={dark.glowPurple} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {yLabels.map((h) => (
          <Line key={h} x1={PAD.l} y1={y(h)} x2={CHART_W - PAD.r} y2={y(h)} stroke={dark.bgBorder} strokeWidth={1} />
        ))}

        <Polygon points={bandPoints} fill="url(#bg)" />

        <Polyline points={actualPoints} fill="none" stroke={dark.glowGreen} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <Polyline points={projectedPoints} fill="none" stroke={dark.glowPurple} strokeWidth={3} strokeDasharray="6,4" strokeLinejoin="round" strokeLinecap="round" />

        <Line x1={x(curIdx, total)} y1={y(actual[actual.length - 1])} x2={x(curIdx, total)} y2={PAD.t} stroke={dark.bgBorder} strokeWidth={1} strokeDasharray="3,3" />
      </Svg>

      {yLabels.map((h) => (
        <Text key={h} style={[s.axisY, { top: y(h) - 7 }]}>{h}</Text>
      ))}

      {xLabels.map((age, i) => (
        <Text key={age} style={[s.axisX, { left: x(i * 2, total) - 10, top: CHART_H - 12 }]}>{age}</Text>
      ))}

      <Text style={s.axisAge}>Age</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 36, color: dark.glowPurple, marginBottom: 4 },
  chartCard: { padding: 12, alignItems: 'center' },
  chartWrap: { width: CHART_W, height: CHART_H, position: 'relative' },
  axisY: { position: 'absolute', left: 2, fontSize: 10, fontFamily: Fonts.mono, color: dark.textMuted },
  axisX: { position: 'absolute', fontSize: 10, fontFamily: Fonts.mono, color: dark.textMuted, textAlign: 'center', width: 20 },
  axisAge: { position: 'absolute', bottom: -2, right: PAD.r, fontSize: 9, fontFamily: Fonts.mono, color: dark.textMuted },
  finalWrap: { alignItems: 'center', gap: 2, paddingVertical: 8 },
  finalLabel: { fontSize: 13, fontFamily: Fonts.medium, color: dark.textSecond },
  finalValue: { fontFamily: Fonts.display, fontSize: 56, lineHeight: 62, color: dark.glowPurple },
  finalSub: { fontSize: 12, fontFamily: Fonts.regular, color: dark.textMuted },
  factorsCard: { gap: 12 },
  factorsTitle: { fontSize: 14, fontFamily: Fonts.bold, color: dark.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  factorRow: { gap: 6 },
  factorLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  factorLabel: { fontSize: 13, fontFamily: Fonts.medium, color: dark.textSecond },
  factorPct: { fontSize: 13, fontFamily: Fonts.bold, color: dark.textPrimary },
  factorTrack: { height: 6, borderRadius: 3, backgroundColor: dark.bgBorder, overflow: 'hidden' },
  factorBar: { height: 6, borderRadius: 3, backgroundColor: dark.glowPurple },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: dark.glowPurple, borderRadius: 14, paddingVertical: 16, marginTop: 4 },
  ctaText: { fontSize: 15, fontFamily: Fonts.bold, color: '#000' },
})