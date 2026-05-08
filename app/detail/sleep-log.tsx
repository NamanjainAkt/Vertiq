import { useState, useMemo, useEffect } from 'react'
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { useSleepLogs, useDeleteSleepLog, useUpdateSleepLog } from '@/hooks/useSleepLogs'
import type { SleepLog } from '@/lib/types'

const EMOJIS = ['😴', '😪', '😐', '😊', '🌟']
const GH_START = 22
const GH_END = 26

function parseTime(t: string): number {
  const [time, ampm] = t.split(' ')
  if (!time) return 0
  let [h, m] = time.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h + m / 60
}

function formatTime24(t: string): string {
  const [time, ampm] = t.split(' ')
  if (!time) return '--'
  let [h, m] = time.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  const am = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${am}`
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function SleepLogDetail() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: sleepLogs, isLoading } = useSleepLogs()
  const deleteLog = useDeleteSleepLog()
  const updateLog = useUpdateSleepLog()

  const sleepLog = useMemo(() => {
    return sleepLogs?.find((l) => l.id === id)
  }, [sleepLogs, id])

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null)

  useEffect(() => {
    if (sleepLog?.quality_score) {
      setSelectedQuality(sleepLog.quality_score - 1)
    }
  }, [sleepLog])

  if (isLoading) {
    return (
      <View style={[s.root, s.centered]}>
        <ActivityIndicator color={dark.glowBlue} />
      </View>
    )
  }

  if (!sleepLog) {
    return (
      <View style={s.root}>
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={dark.textSecond} />
          </Pressable>
          <Text style={s.headerTitle}>Sleep Log</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.centered}>
          <Text style={{ color: dark.textMuted }}>Sleep log not found</Text>
        </View>
      </View>
    )
  }

  const bedtime = sleepLog ? formatTime24(sleepLog.bedtime) : '--'
  const waketime = sleepLog ? formatTime24(sleepLog.wake_time) : '--'
  const dateStr = sleepLog ? formatDate(sleepLog.logged_date) : '--'
  const quality = selectedQuality ?? (sleepLog?.quality_score ?? 2) - 1
  const notes = sleepLog?.notes ?? ''
  const duration = sleepLog ? formatDuration(sleepLog.duration_min) : '--'

  const bed = sleepLog ? parseTime(sleepLog.bedtime) : 0
  const wake = sleepLog ? parseTime(sleepLog.wake_time) : 0
  const totalH = wake > bed ? wake - bed : wake + 24 - bed
  const ghStartCalc = Math.max(bed, GH_START)
  const ghEndCalc = Math.min(wake, GH_END)
  const hasGH = ghStartCalc < ghEndCalc && wake > bed
  const ghLeftPct = hasGH ? ((ghStartCalc - bed) / totalH) * 100 : 0
  const ghWidthPct = hasGH ? ((ghEndCalc - ghStartCalc) / totalH) * 100 : 0

  async function handleDelete() {
    if (!sleepLog) return
    await deleteLog.mutateAsync(sleepLog.id)
    router.back()
  }

  async function handleQualityUpdate(idx: number) {
    if (!sleepLog) return
    setSelectedQuality(idx)
    await updateLog.mutateAsync({
      id: sleepLog.id,
      updates: { quality_score: (idx + 1) as 1 | 2 | 3 | 4 | 5 },
    })
  }

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={dark.textSecond} />
        </Pressable>
        <Text style={s.headerTitle}>Sleep Log</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.dateText}>{dateStr}</Text>

        {/* Timeline */}
        <GlowCard glow="blue">
          <Text style={s.sectionLabel}>Sleep Timeline</Text>
          <View style={s.timelineOuter}>
            <View style={s.timelineBar}>
              <View style={s.sleepFill} />
              {hasGH && (
                <View style={[s.ghBand, { left: `${ghLeftPct}%`, width: `${ghWidthPct}%` }]} />
              )}
            </View>
            <View style={s.timelineLabels}>
              <Text style={s.timelineLabel}>{bedtime}</Text>
              <Text style={s.timelineLabel}>{waketime}</Text>
            </View>
          </View>
          <View style={s.ghLegend}>
            <View style={s.ghDot} />
            <Text style={s.ghLegendText}>Growth Hormone Window (10 PM – 2 AM)</Text>
          </View>
        </GlowCard>

        {/* Quality */}
        <GlowCard glow="blue">
          <Text style={s.sectionLabel}>Quality</Text>
          <View style={s.emojiRow}>
            {EMOJIS.map((emoji, i) => (
              <Pressable
                key={i}
                style={[s.emojiPill, quality === i && s.emojiActive]}
                onPress={() => handleQualityUpdate(i)}
              >
                <Text style={s.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </GlowCard>

        {/* Details */}
        <GlowCard glow="blue">
          <Text style={s.sectionLabel}>Details</Text>
          <DetailRow label="Duration" value={duration} />
          <DetailRow label="Bedtime" value={bedtime} />
          <DetailRow label="Wake" value={waketime} last />
          {notes ? (
            <View style={s.notesBox}>
              <Text style={s.notesLabel}>Notes</Text>
              <Text style={s.notesText}>{notes}</Text>
            </View>
          ) : null}
        </GlowCard>

        {/* Actions */}
        <View style={s.actionsRow}>
          <Pressable style={s.editBtn}>
            <Ionicons name="pencil-outline" size={16} color="#000" />
            <Text style={s.editBtnText}>Edit</Text>
          </Pressable>
          {confirmDelete ? (
            <View style={s.confirmRow}>
              <Text style={s.confirmText}>Delete this entry?</Text>
              <Pressable style={s.confirmYes} onPress={handleDelete} disabled={deleteLog.isPending}>
                {deleteLog.isPending ? <ActivityIndicator color="#000" size="small" /> : <Text style={s.confirmYesText}>Yes</Text>}
              </Pressable>
              <Pressable style={s.confirmNo} onPress={() => setConfirmDelete(false)}>
                <Text style={s.confirmNoText}>No</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={s.deleteBtn} onPress={() => setConfirmDelete(true)}>
              <Ionicons name="trash-outline" size={16} color={dark.glowRed} />
              <Text style={s.deleteBtnText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.detailRow, !last && s.detailDivider]}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { fontSize: 16.5, fontFamily: Fonts.bold, color: dark.textPrimary },
  scroll: { padding: 20, gap: 14 },
  dateText: { fontSize: 18, fontFamily: Fonts.semibold, color: dark.textPrimary },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  timelineOuter: { gap: 6 },
  timelineBar: {
    height: 28,
    borderRadius: 14,
    backgroundColor: dark.bgBorder,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  sleepFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    backgroundColor: `${dark.glowBlue}30`,
  },
  ghBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: `${dark.glowGreen}50`,
    borderRadius: 4,
  },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineLabel: { fontSize: 10, fontFamily: Fonts.mono, color: dark.textMuted },
  ghLegend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  ghDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: dark.glowGreen },
  ghLegendText: { fontSize: 10, fontFamily: Fonts.regular, color: dark.textSecond },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  emojiPill: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dark.bgBorder,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emojiActive: { backgroundColor: `${dark.glowBlue}20`, borderColor: dark.glowBlue },
  emojiText: { fontSize: 22 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark.bgBorder },
  detailLabel: { fontSize: 13, fontFamily: Fonts.regular, color: dark.textSecond },
  detailValue: { fontSize: 14, fontFamily: Fonts.mono, color: dark.textPrimary },
  notesBox: { marginTop: 8, gap: 4 },
  notesLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: { fontSize: 13, fontFamily: Fonts.regular, color: dark.textSecond, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: dark.glowBlue,
    borderRadius: 14,
    paddingVertical: 14,
  },
  editBtnText: { fontSize: 15, fontFamily: Fonts.bold, color: '#000' },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: `${dark.glowRed}15`,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${dark.glowRed}40`,
    paddingVertical: 14,
  },
  deleteBtnText: { fontSize: 15, fontFamily: Fonts.bold, color: dark.glowRed },
  confirmRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${dark.glowRed}40`,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  confirmText: { fontSize: 12, fontFamily: Fonts.medium, color: dark.textSecond },
  confirmYes: {
    backgroundColor: dark.glowRed,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  confirmYesText: { fontSize: 13, fontFamily: Fonts.bold, color: '#000' },
  confirmNo: {
    borderWidth: 1,
    borderColor: dark.textMuted,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  confirmNoText: { fontSize: 13, fontFamily: Fonts.bold, color: dark.textSecond },
})