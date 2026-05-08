import { useState } from 'react'
import { View, ScrollView, Pressable, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

interface RoutineExercise {
  id: string
  name: string
  sets: number
  reps: string
  icon: keyof typeof Ionicons.glyphMap
}

const ROUTINE_MOCK = {
  id: '1',
  name: 'Full Body Stretch',
  difficulty: 'Beginner' as Difficulty,
  duration: '22 min',
  calories: '145 kcal',
  target: 'Full Body',
  gradientColors: ['#00FF87', '#00BFFF', '#B44FFF'] as [string, string, string],
  exercises: [
    { id: 'e1', name: 'Neck Rolls', sets: 3, reps: '30 sec', icon: 'accessibility-outline' },
    { id: 'e2', name: 'Cat-Cow Stretch', sets: 3, reps: '12 reps', icon: 'pulse-outline' },
    { id: 'e3', name: 'Standing Forward Fold', sets: 4, reps: '15 reps', icon: 'accessibility-outline' },
    { id: 'e4', name: 'Wall Posture Fix', sets: 3, reps: '45 sec', icon: 'body-outline' },
    { id: 'e5', name: 'Seated Spine Twist', sets: 3, reps: '10 reps', icon: 'pulse-outline' },
    { id: 'e6', name: 'Hamstring Stretch', sets: 3, reps: '30 sec', icon: 'accessibility-outline' },
  ],
}

export default function RoutineDetailScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const routine = ROUTINE_MOCK

  function toggleExpand(exId: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(exId)) next.delete(exId)
      else next.add(exId)
      return next
    })
  }

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={routine.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.banner, { paddingTop: insets.top + 60 }]}
        >
          <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </Pressable>
        </LinearGradient>

        <View style={s.headerSection}>
          <View style={s.titleRow}>
            <Text style={s.routineName}>{routine.name}</Text>
            <View style={[s.difficultyChip, routine.difficulty === 'Advanced' && s.difficultyAdvanced]}>
              <Text style={s.difficultyText}>{routine.difficulty}</Text>
            </View>
          </View>

          <View style={s.statsRow}>
            <StatItem icon="time-outline" label={routine.duration} />
            <StatItem icon="flame-outline" label={routine.calories} />
            <StatItem icon="body-outline" label={routine.target} />
          </View>
        </View>

        <Text style={s.sectionLabel}>Exercises</Text>

        <View style={s.exerciseList}>
          {routine.exercises.map((ex) => {
            const isExpanded = expanded.has(ex.id)
            return (
              <Pressable
                key={ex.id}
                onPress={() => toggleExpand(ex.id)}
                style={[s.exCard, isExpanded && s.exCardExpanded]}
              >
                <View style={s.exRow}>
                  <View style={s.exIconWrap}>
                    <Ionicons name={ex.icon as any} size={20} color={dark.glowGreen} />
                  </View>
                  <View style={s.exInfo}>
                    <Text style={s.exName}>{ex.name}</Text>
                    <Text style={s.exDetail}>{ex.sets} sets · {ex.reps}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={dark.textMuted}
                  />
                </View>
                {isExpanded && (
                  <View style={s.exDropdown}>
                    <View style={s.dropdownRow}>
                      <Text style={s.dropdownLabel}>Sets</Text>
                      <Text style={s.dropdownValue}>{ex.sets}</Text>
                    </View>
                    <View style={s.dropdownRow}>
                      <Text style={s.dropdownLabel}>Reps / Hold</Text>
                      <Text style={s.dropdownValue}>{ex.reps}</Text>
                    </View>
                    <View style={s.dropdownRow}>
                      <Text style={s.dropdownLabel}>Rest</Text>
                      <Text style={s.dropdownValue}>60 sec</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      <View style={[s.ctaWrap, { bottom: insets.bottom + 16 }]}>
        <Pressable style={s.cta} onPress={() => {}}>
          <Text style={s.ctaText}>Start Routine</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </Pressable>
      </View>
    </View>
  )
}

function StatItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={s.statItem}>
      <View style={s.statIconWrap}>
        <Ionicons name={icon} size={18} color={dark.glowGreen} />
      </View>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },

  scroll: { gap: 0 },

  banner: {
    height: 220,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  routineName: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: dark.textPrimary,
    flex: 1,
  },
  difficultyChip: {
    backgroundColor: 'rgba(0,255,135,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.3)',
  },
  difficultyAdvanced: {
    backgroundColor: 'rgba(255,61,90,0.12)',
    borderColor: 'rgba(255,61,90,0.3)',
  },
  difficultyText: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    color: dark.glowGreen,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: dark.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: dark.bgBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,255,135,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: dark.textSecond,
    flexShrink: 1,
  },

  sectionLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 17,
    color: dark.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 14,
  },

  exerciseList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  exCard: {
    backgroundColor: dark.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: dark.bgBorder,
    overflow: 'hidden',
  },
  exCardExpanded: {
    borderColor: 'rgba(0,255,135,0.25)',
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  exIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,255,135,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exInfo: { flex: 1, gap: 2 },
  exName: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: dark.textPrimary,
  },
  exDetail: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: dark.textMuted,
  },

  exDropdown: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: dark.bgBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: dark.textMuted,
  },
  dropdownValue: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: dark.textPrimary,
  },

  ctaWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  cta: {
    backgroundColor: dark.glowGreen,
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...glowShadow(dark.glowGreen, 0.4),
  },
  ctaText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#000',
  },
})
