import { useState, useMemo } from 'react'
import { View, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { useTodayNutrition, useLogNutrition } from '@/hooks/useNutritionLogs'

const AMBER = '#E07B00'

const NUTRIENT_DATA: Record<string, { desc: string; goal: number; unit: string; foods: { rank: number; emoji: string; name: string; amount: string }[] }> = {
  Calcium: {
    desc: 'Supports bone density, muscle contraction, nerve signaling, and blood clotting.',
    goal: 1200, unit: 'mg',
    foods: [
      { rank: 1, emoji: '🥛', name: 'Milk (fortified)', amount: '300mg per cup' },
      { rank: 2, emoji: '🧀', name: 'Cheese', amount: '200mg per 30g' },
      { rank: 3, emoji: '🥬', name: 'Collard Greens', amount: '180mg per cup' },
      { rank: 4, emoji: '🥦', name: 'Broccoli', amount: '60mg per cup' },
      { rank: 5, emoji: '🐟', name: 'Sardines (with bones)', amount: '240mg per 75g' },
      { rank: 6, emoji: '🥜', name: 'Almonds', amount: '75mg per 30g' },
    ],
  },
  'Vitamin D': {
    desc: 'Enhances calcium absorption for bone growth and immune function.',
    goal: 600, unit: 'IU',
    foods: [
      { rank: 1, emoji: '☀️', name: 'Sunlight', amount: 'Variable' },
      { rank: 2, emoji: '🐟', name: 'Salmon', amount: '450 IU per 3oz' },
      { rank: 3, emoji: '🥚', name: 'Eggs', amount: '40 IU per item' },
      { rank: 4, emoji: '🥛', name: 'Fortified Milk', amount: '100 IU per cup' },
    ],
  },
  Protein: {
    desc: 'Builds tissue and supports growth hormone production.',
    goal: 60, unit: 'g',
    foods: [
      { rank: 1, emoji: '🐟', name: 'Salmon', amount: '25g per 3oz' },
      { rank: 2, emoji: '🥚', name: 'Eggs', amount: '6g per item' },
      { rank: 3, emoji: '🥛', name: 'Greek Yogurt', amount: '17g per cup' },
      { rank: 4, emoji: '🍗', name: 'Chicken', amount: '26g per 3oz' },
    ],
  },
  Zinc: {
    desc: 'Essential for cell growth and DNA synthesis.',
    goal: 15, unit: 'mg',
    foods: [
      { rank: 1, emoji: '🥩', name: 'Beef', amount: '5mg per 3oz' },
      { rank: 2, emoji: '🐟', name: 'Oysters', amount: '30mg per 3oz' },
      { rank: 3, emoji: '🥜', name: 'Almonds', amount: '1mg per oz' },
    ],
  },
  Magnesium: {
    desc: 'Supports bone structure and sleep quality.',
    goal: 420, unit: 'mg',
    foods: [
      { rank: 1, emoji: '🥬', name: 'Spinach', amount: '80mg per cup' },
      { rank: 2, emoji: '🥜', name: 'Almonds', amount: '75mg per oz' },
      { rank: 3, emoji: '🥑', name: 'Avocado', amount: '58mg per item' },
    ],
  },
  'Vitamin K2': {
    desc: 'Directs calcium to bones, not arteries.',
    goal: 120, unit: 'mcg',
    foods: [
      { rank: 1, emoji: '🧀', name: 'Natto', amount: '500mcg per 3oz' },
      { rank: 2, emoji: '🧀', name: 'Hard Cheese', amount: '75mcg per oz' },
      { rank: 3, emoji: '🥚', name: 'Egg Yolk', amount: '32mcg per item' },
    ],
  },
}

const DEFICIENCY_SIGNS = [
  'Muscle cramps or spasms',
  'Numbness / tingling in fingers',
  'Fatigue and low energy',
  'Poor bone density',
  'Irregular heartbeat',
  'Difficulty sleeping',
  'Dry skin and brittle nails',
  'Cognitive fog / confusion',
]

export default function NutritionDetailScreen() {
  const insets = useSafeAreaInsets()
  const { name } = useLocalSearchParams<{ name: string }>()

  const nutrientName = name ?? 'Calcium'
  const info = NUTRIENT_DATA[nutrientName] ?? NUTRIENT_DATA.Calcium

  const { data: todayLogs, isLoading } = useTodayNutrition()
  const logNutrition = useLogNutrition()

  const [showDeficiency, setShowDeficiency] = useState(false)
  const [showLogInput, setShowLogInput] = useState(false)
  const [customAmount, setCustomAmount] = useState('')

  const loggedAmount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const logs = (todayLogs ?? []).filter((l) => l.logged_date === today && l.nutrient === nutrientName.toLowerCase().replace(' ', '_'))
    return logs.reduce((sum, l) => sum + (l.amount_mg ?? 0), 0)
  }, [todayLogs, nutrientName])

  const pct = Math.min((loggedAmount / info.goal) * 100, 100)

  async function handleLog() {
    const amount = parseInt(customAmount, 10)
    if (!amount || amount <= 0) return

    await logNutrition.mutateAsync({
      nutrient: nutrientName.toLowerCase().replace(' ', '_'),
      logged_date: new Date().toISOString().slice(0, 10),
      amount_mg: amount,
      goal_mg: info.goal,
    })
    setShowLogInput(false)
    setCustomAmount('')
  }

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={dark.textSecond} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>Nutrition Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.nutrientName}>{nutrientName}</Text>
        <Text style={s.benefit}>{info.desc}</Text>

        <GlowCard glow="amber" style={s.rdaCard}>
          <View style={s.rdaRow}>
            <View style={s.rdaIconWrap}>
              <Ionicons name="flask" size={22} color={AMBER} />
            </View>
            <View style={s.rdaContent}>
              <Text style={s.rdaLabel}>Recommended Daily Amount</Text>
              <Text style={s.rdaValue}>{info.goal.toLocaleString()} {info.unit}</Text>
              <Text style={s.rdaSub}>Adults 19–50 years</Text>
            </View>
          </View>
          <View style={s.rdaProgress}>
            <View style={s.rdaTrack}>
              <View style={[s.rdaFill, { width: `${pct}%` }]} />
            </View>
            <Text style={s.rdaProgressLabel}>{loggedAmount} / {info.goal.toLocaleString()} {info.unit}</Text>
          </View>
        </GlowCard>

        <Text style={s.sectionTitle}>Top Food Sources</Text>
        <View style={s.foodList}>
          {info.foods.map((food) => (
            <View key={food.rank} style={s.foodRow}>
              <View style={s.foodRank}>
                <Text style={s.foodRankText}>{food.rank}</Text>
              </View>
              <Text style={s.foodEmoji}>{food.emoji}</Text>
              <View style={s.foodInfo}>
                <Text style={s.foodName}>{food.name}</Text>
                <Text style={s.foodAmount}>{food.amount}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={s.deficiencyToggle} onPress={() => setShowDeficiency((p) => !p)}>
          <View style={s.deficiencyHeader}>
            <Ionicons name="warning-outline" size={18} color={AMBER} />
            <Text style={s.deficiencyTitle}>Deficiency Warning Signs</Text>
          </View>
          <Ionicons name={showDeficiency ? 'chevron-up' : 'chevron-down'} size={18} color={dark.textSecond} />
        </Pressable>
        {showDeficiency && (
          <View style={s.deficiencyBody}>
            {DEFICIENCY_SIGNS.map((sign) => (
              <View key={sign} style={s.deficiencyRow}>
                <View style={s.deficiencyDot} />
                <Text style={s.deficiencyText}>{sign}</Text>
              </View>
            ))}
          </View>
        )}

        {showLogInput ? (
          <View style={s.logInputCard}>
            <Text style={s.logInputLabel}>Enter amount ({info.unit})</Text>
            <TextInput
              style={s.logInput}
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder={`Amount in ${info.unit}`}
              placeholderTextColor={dark.textMuted}
              keyboardType="numeric"
            />
            <View style={s.logInputBtns}>
              <Pressable style={s.logInputCancel} onPress={() => setShowLogInput(false)}>
                <Text style={s.logInputCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={s.logInputSave} onPress={handleLog} disabled={logNutrition.isPending}>
                {logNutrition.isPending ? <ActivityIndicator color="#000" /> : <Text style={s.logInputSaveText}>Log</Text>}
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={s.logBtn} onPress={() => setShowLogInput(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#000" />
            <Text style={s.logBtnText}>Log Intake</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { padding: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: dark.bgBorder,
  },
  headerTitle: { flex: 1, fontSize: 16.5, fontFamily: Fonts.bold, color: dark.textPrimary, textAlign: 'center' },
  nutrientName: { fontSize: 32, fontFamily: Fonts.display, color: dark.textPrimary, letterSpacing: 1 },
  benefit: { fontSize: 14, fontFamily: Fonts.regular, color: dark.textSecond, lineHeight: 20, marginTop: -4 },
  rdaCard: { gap: 12 },
  rdaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rdaIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: `${AMBER}18`, alignItems: 'center', justifyContent: 'center' },
  rdaContent: { flex: 1, gap: 2 },
  rdaLabel: { fontSize: 11, fontFamily: Fonts.medium, color: dark.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  rdaValue: { fontSize: 22, fontFamily: Fonts.bold, color: dark.textPrimary },
  rdaSub: { fontSize: 12, fontFamily: Fonts.regular, color: dark.textSecond },
  rdaProgress: { gap: 6 },
  rdaTrack: { height: 6, borderRadius: 3, backgroundColor: dark.bgBorder },
  rdaFill: { height: 6, borderRadius: 3, backgroundColor: AMBER },
  rdaProgressLabel: { fontSize: 12, fontFamily: Fonts.mono, color: dark.textSecond },
  sectionTitle: { fontSize: 14, fontFamily: Fonts.bold, color: dark.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  foodList: { backgroundColor: dark.bgSurface, borderRadius: 16, borderWidth: 1, borderColor: dark.bgBorder, overflow: 'hidden' },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark.bgBorder },
  foodRank: { width: 22, height: 22, borderRadius: 11, backgroundColor: dark.bgBorder, alignItems: 'center', justifyContent: 'center' },
  foodRankText: { fontSize: 11, fontFamily: Fonts.semibold, color: dark.textSecond },
  foodEmoji: { fontSize: 22 },
  foodInfo: { flex: 1, gap: 1 },
  foodName: { fontSize: 14, fontFamily: Fonts.semibold, color: dark.textPrimary },
  foodAmount: { fontSize: 12, fontFamily: Fonts.mono, color: dark.textSecond },
  deficiencyToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: dark.bgSurface, borderRadius: 16, borderWidth: 1, borderColor: dark.bgBorder, padding: 14 },
  deficiencyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deficiencyTitle: { fontSize: 14, fontFamily: Fonts.semibold, color: dark.textPrimary },
  deficiencyBody: { backgroundColor: dark.bgSurface, borderRadius: 16, borderWidth: 1, borderColor: dark.bgBorder, padding: 14, gap: 10, marginTop: -8 },
  deficiencyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deficiencyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: AMBER },
  deficiencyText: { fontSize: 13, fontFamily: Fonts.regular, color: dark.textSecond, lineHeight: 18 },
  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: AMBER, borderRadius: 14, paddingVertical: 14, marginTop: 4, ...glowShadow(AMBER, 0.3) },
  logBtnText: { fontSize: 16, fontFamily: Fonts.semibold, color: '#000' },
  logInputCard: { backgroundColor: dark.bgSurface, borderRadius: 16, borderWidth: 1, borderColor: dark.bgBorder, padding: 16, gap: 12 },
  logInputLabel: { fontSize: 13, fontFamily: Fonts.semibold, color: dark.textSecond },
  logInput: { backgroundColor: dark.bgBase, borderRadius: 12, padding: 12, color: dark.textPrimary, fontFamily: Fonts.mono, fontSize: 16 },
  logInputBtns: { flexDirection: 'row', gap: 12 },
  logInputCancel: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: dark.bgBorder, alignItems: 'center' },
  logInputCancelText: { fontSize: 14, fontFamily: Fonts.semibold, color: dark.textSecond },
  logInputSave: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: AMBER, alignItems: 'center', ...glowShadow(AMBER, 0.3) },
  logInputSaveText: { fontSize: 14, fontFamily: Fonts.semibold, color: '#000' },
})