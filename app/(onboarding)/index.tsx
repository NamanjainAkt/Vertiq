/**
 * Profile Setup — Screen 3 (TallUp)
 *
 * Multi-step wizard:
 *   Step 1: Basic Info (Age, Sex, Ethnicity)
 *   Step 2: Measurements (Height, Weight)
 *   Step 3: Goals (Goal height, Commitment)
 *
 * 3-step progress bar at top. Bottom-fixed CTA.
 */
import { useState } from 'react'
import {
  View, Pressable, StyleSheet, ScrollView, Platform,
} from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { Ionicons } from '@expo/vector-icons'
import { updateTallUpProfile } from '@/lib/api/tallup'

const STEPS = ['Basic Info', 'Measurements', 'Goals']
const SEX_OPTIONS = ['Male', 'Female']
const ETHNICITY_OPTIONS = [
  'Asian', 'Black / African', 'Hispanic / Latino', 'Middle Eastern',
  'White / Caucasian', 'Mixed', 'Other', 'Prefer not to say',
]
const COMMITMENT_OPTIONS = ['3 days/week', '5 days/week', '7 days/week']

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState(0)

  // Step 1
  const [age, setAge] = useState('16')
  const [sex, setSex] = useState<'Male' | 'Female' | null>(null)
  const [ethnicity, setEthnicity] = useState('')

  // Step 2
  const [heightCm, setHeightCm] = useState('170')
  const [weight, setWeight] = useState('')

  // Step 3
  const [goalHeight, setGoalHeight] = useState('180')
  const [commitment, setCommitment] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLast = step === STEPS.length - 1

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return age.trim().length > 0 && sex !== null
      case 1: return heightCm.trim().length > 0
      case 2: return goalHeight.trim().length > 0 && commitment !== null
      default: return true
    }
  }

  const handleNext = () => {
    if (!canProceed()) return
    if (isLast) {
      handleSave()
    } else {
      setStep((s) => s + 1)
      setError(null)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    track('profile_setup_completed')

    const user = (await supabase.auth.getUser()).data.user
    if (!user) {
      setError('Not authenticated. Please try again.')
      setSaving(false)
      return
    }

    const commitmentDays = commitment === '3 days/week' ? 3 : commitment === '5 days/week' ? 5 : 7

    const { error: err } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        full_name: user.user_metadata?.full_name ?? '',
        age: parseInt(age, 10),
        biological_sex: sex,
        ethnicity: ethnicity || undefined,
        height_cm: parseFloat(heightCm),
        weight_kg: weight ? parseFloat(weight) : undefined,
        goal_height_cm: parseInt(goalHeight, 10),
        commitment_days: commitmentDays,
      },
    })

    if (err) {
      setSaving(false)
      setError('Could not save. Please try again.')
      return
    }

    await updateTallUpProfile(user.id, {
      display_name: user.user_metadata?.full_name || null,
      age: parseInt(age, 10),
      biological_sex: sex,
      ethnicity: ethnicity || null,
      height_cm: parseFloat(heightCm),
      weight_kg: weight ? parseFloat(weight) : null,
      goal_height_cm: parseInt(goalHeight, 10),
      commitment_days: commitmentDays,
    })

    setSaving(false)
    // _layout.tsx picks up onboarding_completed and routes to (tabs)
  }

  return (
    <View style={s.root}>
      {/* Progress bar */}
      <View style={[s.progressWrap, { paddingTop: insets.top + 16 }]}>
        <View style={s.progressBar}>
          {STEPS.map((_, idx) => (
            <View
              key={idx}
              style={[
                s.progressDot,
                { backgroundColor: idx <= step ? dark.glowGreen : dark.bgBorder },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View key={`step-${step}`} entering={FadeInDown.duration(300)} style={s.stepContent}>
          {step === 0 && (
            <>
              <Text style={s.stepTitle}>About You</Text>
              <Text style={s.stepSub}>Help us personalize your growth plan.</Text>

              {/* Age */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>AGE</Text>
                <View style={s.numberRow}>
                  {['13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'].map(
                    (val) => (
                      <Pressable
                        key={val}
                        onPress={() => setAge(val)}
                        style={[
                          s.chip,
                          age === val && { backgroundColor: dark.glowGreen, borderColor: dark.glowGreen },
                        ]}
                      >
                        <Text style={[s.chipText, age === val && { color: '#000' }]}>{val}</Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>

              {/* Sex */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>BIOLOGICAL SEX</Text>
                <View style={s.inlineRow}>
                  {SEX_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setSex(opt as any)}
                      style={[
                        s.inlineChip,
                        sex === opt && { backgroundColor: dark.glowGreen, borderColor: dark.glowGreen },
                      ]}
                    >
                      <Text style={[s.chipText, sex === opt && { color: '#000' }]}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Ethnicity */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>ETHNICITY (optional)</Text>
                <View style={s.chipRow}>
                  {ETHNICITY_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setEthnicity(ethnicity === opt ? '' : opt)}
                      style={[
                        s.chip,
                        ethnicity === opt && { backgroundColor: dark.glowGreen, borderColor: dark.glowGreen },
                      ]}
                    >
                      <Text style={[s.chipText, ethnicity === opt && { color: '#000' }]}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={s.stepTitle}>Your Measurements</Text>
              <Text style={s.stepSub}>Current height helps us track progress.</Text>

              {/* Height */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>CURRENT HEIGHT (cm)</Text>
                <View style={s.heightInputRow}>
                  <Text style={s.heightValue}>{heightCm}</Text>
                  <Text style={s.heightUnit}>cm</Text>
                </View>
                <View style={s.sliderRow}>
                  {Array.from({ length: 121 }, (_, i) => i + 120).map((val) => (
                    <Pressable
                      key={val}
                      onPress={() => setHeightCm(String(val))}
                      style={[
                        s.heightTick,
                        parseInt(heightCm) === val && { backgroundColor: dark.glowGreen },
                      ]}
                    />
                  ))}
                </View>
                <View style={s.sliderLabels}>
                  <Text style={s.sliderLabel}>120</Text>
                  <Text style={s.sliderLabel}>240</Text>
                </View>
              </View>

              {/* Weight */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>WEIGHT — kg (optional)</Text>
                <View style={s.inlineRow}>
                  {['50', '55', '60', '65', '70', '75', '80', '85', '90', '95+'].map((val) => (
                    <Pressable
                      key={val}
                      onPress={() => setWeight(weight === val ? '' : val)}
                      style={[
                        s.inlineChip,
                        weight === val && { backgroundColor: dark.glowGreen, borderColor: dark.glowGreen },
                      ]}
                    >
                      <Text style={[s.chipText, weight === val && { color: '#000' }]}>{val}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={s.stepTitle}>Your Goals</Text>
              <Text style={s.stepSub}>Dream big — we'll help you get there.</Text>

              {/* Goal height */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>GOAL HEIGHT (cm)</Text>
                <View style={s.heightInputRow}>
                  <Text style={[s.heightValue, { color: dark.glowPurple }]}>{goalHeight}</Text>
                  <Text style={[s.heightUnit, { color: dark.glowPurple }]}>cm</Text>
                </View>
                <View style={s.sliderRow}>
                  {Array.from({ length: 81 }, (_, i) => i + 150).map((val) => (
                    <Pressable
                      key={val}
                      onPress={() => setGoalHeight(String(val))}
                      style={[
                        s.heightTick,
                        parseInt(goalHeight) === val && { backgroundColor: dark.glowPurple },
                      ]}
                    />
                  ))}
                </View>
                <View style={s.sliderLabels}>
                  <Text style={s.sliderLabel}>150</Text>
                  <Text style={s.sliderLabel}>230</Text>
                </View>
              </View>

              {/* Commitment */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>HOW OFTEN CAN YOU COMMIT?</Text>
                {COMMITMENT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setCommitment(opt)}
                    style={[
                      s.commitChip,
                      commitment === opt && { backgroundColor: 'rgba(0,255,135,0.1)', borderColor: dark.glowGreen },
                    ]}
                  >
                    <Text style={[s.chipText, commitment === opt && { color: dark.glowGreen, fontFamily: Fonts.bold }]}>
                      {opt}
                    </Text>
                    {commitment === opt && (
                      <Ionicons name="checkmark-circle" size={20} color={dark.glowGreen} />
                    )}
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {error && (
            <Animated.View entering={FadeIn.duration(180)} style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom fixed CTA */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.bottomRow}>
          {step > 0 && (
            <Pressable onPress={handleBack} style={s.backBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={dark.textSecond} />
              <Text style={s.backText}>Back</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleNext}
            disabled={!canProceed() || saving}
            style={({ pressed }) => [
              s.nextBtn,
              { backgroundColor: dark.glowGreen, ...glowShadow(dark.glowGreen, 0.35) },
              !canProceed() && { opacity: 0.4 },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={s.nextBtnText}>
              {saving ? 'Saving...' : isLast ? 'Finish Setup →' : 'Next →'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  progressWrap: { paddingHorizontal: 24, paddingBottom: 8 },
  progressBar: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  progressDot: { width: 40, height: 4, borderRadius: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24 },
  stepContent: { gap: 28 },

  // Step header
  stepTitle: { fontSize: 28, fontFamily: Fonts.bold, color: dark.textPrimary },
  stepSub: { fontSize: 14, color: dark.textSecond, marginTop: -20 },

  // Fields
  fieldGroup: { gap: 10 },
  label: {
    fontSize: 11, fontFamily: Fonts.bold,
    letterSpacing: 0.8, textTransform: 'uppercase',
    color: dark.textMuted,
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1,
    backgroundColor: dark.bgElevated, borderColor: dark.bgBorder,
  },
  chipText: { fontSize: 13, fontFamily: Fonts.medium, color: dark.textPrimary },

  // Inline row (tight chips)
  inlineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  inlineChip: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 999, borderWidth: 1,
    backgroundColor: dark.bgElevated, borderColor: dark.bgBorder,
  },

  // Number age row
  numberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  numberChip: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: dark.bgElevated, borderWidth: 1, borderColor: dark.bgBorder,
  },
  numberText: { fontSize: 14, fontFamily: Fonts.medium, color: dark.textPrimary },

  // Height input
  heightInputRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center',
    gap: 4, paddingVertical: 12,
  },
  heightValue: {
    fontFamily: Fonts.display,
    fontSize: 56,
    color: dark.glowGreen,
    lineHeight: 62,
  },
  heightUnit: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: dark.glowGreen,
    lineHeight: 28,
  },
  sliderRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 2,
    justifyContent: 'center',
  },
  heightTick: {
    width: 4, height: 20, borderRadius: 2,
    backgroundColor: dark.bgBorder,
  },
  sliderLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  sliderLabel: { fontSize: 10, color: dark.textMuted },

  // Commitment
  commitChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 12, borderWidth: 1,
    backgroundColor: dark.bgElevated, borderColor: dark.bgBorder,
    justifyContent: 'space-between',
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(255,61,90,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,61,90,0.2)',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  errorText: { color: dark.glowRed, fontSize: 12.5 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingTop: 12,
    backgroundColor: dark.bgBase,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: dark.bgBorder,
  },
  bottomRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 14, color: dark.textSecond, fontFamily: Fonts.medium },
  nextBtn: { flex: 1, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: '#000', fontSize: 15, fontFamily: Fonts.bold },
})
