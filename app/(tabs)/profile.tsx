import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlowCard } from '@/components/GlowCard'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useProfile } from '@/hooks/useProfile'
import { useLatestHeight } from '@/hooks/useHeightLogs'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { logoutRevenueCat } from '@/lib/purchases'
import { track } from '@/lib/analytics'
import * as api from '@/lib/api/tallup'

const SEX_OPTIONS = ['Male', 'Female']
const COMMITMENT_OPTIONS = [
  { label: '3 days/week', value: 3 },
  { label: '5 days/week', value: 5 },
  { label: '7 days/week', value: 7 },
]

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { data: profile, isLoading } = useProfile()
  const { data: latestHeight } = useLatestHeight()
  const { isPremium } = useSubscription()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<string | null>(null)
  const [goalHeight, setGoalHeight] = useState('')
  const [commitment, setCommitment] = useState<number | null>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.fullName)
      setAge(profile.age?.toString() ?? '')
      setSex(profile.biological_sex)
      setGoalHeight(profile.goalHeightCm?.toString() ?? '')
      setCommitment(profile.commitment_days)
    }
  }, [profile])

  const handleSave = async () => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return
    setSaving(true)
    try {
      await api.updateTallUpProfile(user.id, {
        display_name: displayName || undefined,
        age: age ? parseInt(age, 10) : undefined,
        biological_sex: sex || undefined,
        goal_height_cm: goalHeight ? parseInt(goalHeight, 10) : undefined,
        commitment_days: commitment ?? undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setEditing(false)
    } catch { } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    track('logout')
    logoutRevenueCat()
    await supabase.auth.signOut()
  }

  if (isLoading) {
    return (
      <View style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={dark.glowGreen} />
      </View>
    )
  }

  const currentHeight = latestHeight?.height_cm ?? profile?.goalHeightCm ?? 170
  const initials = profile?.initials ?? '??'
  const name = profile?.fullName ?? 'User'
  const hasChanges = displayName !== profile?.fullName ||
    (age !== '' && parseInt(age) !== (profile?.age ?? 0)) ||
    (sex !== null && sex !== profile?.biological_sex) ||
    (goalHeight !== '' && parseInt(goalHeight) !== (profile?.goalHeightCm ?? 0))

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.title}>Profile</Text>
          <Pressable
            onPress={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            style={[s.editBtn, editing && { backgroundColor: dark.glowGreen }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={[s.editBtnText, editing && { color: '#000' }]}>
                {editing ? 'Save' : 'Edit'}
              </Text>
            )}
          </Pressable>
        </View>

        <View style={s.avatarSection}>
          <View style={[s.avatar, glowShadow(dark.glowGreen, 0.25)]}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          {editing ? (
            <TextInput
              style={s.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={dark.textMuted}
              autoFocus
            />
          ) : (
            <Text style={s.name}>{name}</Text>
          )}
          {isPremium && (
            <View style={s.proBadge}>
              <Text style={s.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        <GlowCard glow="green" style={s.statsCard}>
          <View style={s.statRow}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{currentHeight.toFixed(1)}</Text>
              <Text style={s.statLabel}>Height cm</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{profile?.age ?? '--'}</Text>
              <Text style={s.statLabel}>Age</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{profile?.goalHeightCm ?? '--'}</Text>
              <Text style={s.statLabel}>Goal</Text>
            </View>
          </View>
        </GlowCard>

        <View style={s.fieldsSection}>
          <Text style={s.sectionTitle}>Personal Info</Text>

          <FieldRow label="Age">
            {editing ? (
              <View style={s.chipRow}>
                {['13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'].map((v) => (
                  <Pressable
                    key={v}
                    onPress={() => setAge(age === v ? '' : v)}
                    style={[s.chip, age === v && s.chipActive]}
                  >
                    <Text style={[s.chipText, age === v && s.chipTextActive]}>{v}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={s.fieldValue}>{profile?.age ?? 'Not set'}</Text>
            )}
          </FieldRow>

          <FieldRow label="Sex">
            {editing ? (
              <View style={s.inlineRow}>
                {SEX_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setSex(sex === opt ? null : opt)}
                    style={[s.inlineChip, sex === opt && s.chipActive]}
                  >
                    <Text style={[s.chipText, sex === opt && s.chipTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={s.fieldValue}>{profile?.biological_sex ?? 'Not set'}</Text>
            )}
          </FieldRow>

          <FieldRow label="Height Goal (cm)">
            {editing ? (
              <TextInput
                style={s.numInput}
                value={goalHeight}
                onChangeText={setGoalHeight}
                keyboardType="numeric"
                placeholder="e.g. 180"
                placeholderTextColor={dark.textMuted}
              />
            ) : (
              <Text style={s.fieldValue}>{profile?.goalHeightCm ?? 'Not set'} cm</Text>
            )}
          </FieldRow>

          <FieldRow label="Commitment">
            {editing ? (
              <View style={s.vertRow}>
                {COMMITMENT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setCommitment(commitment === opt.value ? null : opt.value)}
                    style={[s.commitChip, commitment === opt.value && s.commitChipActive]}
                  >
                    <Text style={[s.chipText, commitment === opt.value && { color: dark.glowGreen }]}>
                      {opt.label}
                    </Text>
                    {commitment === opt.value && (
                      <Ionicons name="checkmark-circle" size={20} color={dark.glowGreen} />
                    )}
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={s.fieldValue}>
                {profile?.commitment_days ? `${profile.commitment_days} days/week` : 'Not set'}
              </Text>
            )}
          </FieldRow>
        </View>

        <View style={s.actionsSection}>
          <Pressable style={s.settingsBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={18} color={dark.textSecond} />
            <Text style={s.settingsBtnText}>More Settings</Text>
            <Ionicons name="chevron-forward" size={16} color={dark.textMuted} />
          </Pressable>

          <Pressable style={s.achievementsBtn} onPress={() => router.push('/detail/achievements')}>
            <Ionicons name="trophy-outline" size={18} color={dark.textSecond} />
            <Text style={s.settingsBtnText}>Achievements</Text>
            <Ionicons name="chevron-forward" size={16} color={dark.textMuted} />
          </Pressable>

          <Pressable style={s.growthBtn} onPress={() => router.push('/detail/growth-projection')}>
            <Ionicons name="trending-up-outline" size={18} color={dark.textSecond} />
            <Text style={s.settingsBtnText}>Growth Projection</Text>
            <Ionicons name="chevron-forward" size={16} color={dark.textMuted} />
          </Pressable>

          <Pressable style={s.upgradeBtn} onPress={() => router.push('/upgrade')}>
            <Ionicons name="sparkles-outline" size={18} color={dark.glowPurple} />
            <Text style={[s.settingsBtnText, { color: dark.glowPurple }]}>
              {isPremium ? 'Subscription' : 'Upgrade to Pro'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={dark.textMuted} />
          </Pressable>

          <Pressable style={s.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={dark.glowRed} />
            <Text style={s.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { paddingHorizontal: 20, gap: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 22, fontFamily: Fonts.bold, color: dark.textPrimary },
  editBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: dark.glowGreen,
  },
  editBtnText: { fontSize: 13, fontFamily: Fonts.semibold, color: dark.glowGreen },
  avatarSection: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  avatar: {
    width: 72, height: 72, borderRadius: 999,
    backgroundColor: dark.glowGreen, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontFamily: Fonts.bold, color: '#000' },
  name: { fontSize: 24, fontFamily: Fonts.bold, color: dark.textPrimary, lineHeight: 30 },
  nameInput: {
    fontSize: 20, fontFamily: Fonts.bold, color: dark.textPrimary,
    textAlign: 'center', borderBottomWidth: 1, borderBottomColor: dark.glowGreen,
    paddingBottom: 4, minWidth: 160,
  },
  proBadge: {
    paddingHorizontal: 12, paddingVertical: 3,
    borderRadius: 999, backgroundColor: dark.glowPurple,
  },
  proBadgeText: { fontSize: 10, fontFamily: Fonts.bold, color: '#000' },
  statsCard: { paddingVertical: 16 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: Fonts.display, fontSize: 28, color: dark.textPrimary, lineHeight: 32 },
  statLabel: { fontSize: 11, fontFamily: Fonts.medium, color: dark.textMuted },
  statDivider: { width: 1, height: 36, backgroundColor: dark.bgBorder },
  fieldsSection: {
    backgroundColor: dark.bgSurface, borderRadius: 16, borderWidth: 1,
    borderColor: dark.bgBorder, overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 11, fontFamily: Fonts.bold, color: dark.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },
  fieldRow: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark.bgBorder,
    gap: 6,
  },
  fieldLabel: { fontSize: 11, fontFamily: Fonts.bold, color: dark.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
  fieldValue: { fontSize: 15, fontFamily: Fonts.medium, color: dark.textPrimary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  numInput: {
    fontSize: 16, fontFamily: Fonts.medium, color: dark.textPrimary,
    backgroundColor: dark.bgElevated, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: dark.glowGreen,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: dark.bgBorder, backgroundColor: dark.bgElevated,
  },
  chipActive: { backgroundColor: dark.glowGreen, borderColor: dark.glowGreen },
  chipText: { fontSize: 12, fontFamily: Fonts.medium, color: dark.textPrimary },
  chipTextActive: { color: '#000' },
  inlineRow: { flexDirection: 'row', gap: 10 },
  inlineChip: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: dark.bgBorder, backgroundColor: dark.bgElevated,
  },
  vertRow: { gap: 8 },
  commitChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: dark.bgBorder, backgroundColor: dark.bgElevated,
  },
  commitChipActive: { borderColor: dark.glowGreen, backgroundColor: 'rgba(0,255,135,0.08)' },
  actionsSection: { gap: 10 },
  settingsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.bgSurface, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: dark.bgBorder,
  },
  achievementsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.bgSurface, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: dark.bgBorder,
  },
  growthBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.bgSurface, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: dark.bgBorder,
  },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.bgSurface, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: dark.bgBorder,
  },
  settingsBtnText: { flex: 1, fontSize: 14, fontFamily: Fonts.medium, color: dark.textPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, marginTop: 4,
  },
  logoutText: { fontSize: 14, fontFamily: Fonts.semibold, color: dark.glowRed },
})
