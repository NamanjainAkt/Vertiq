/**
 * Settings & Profile — Screen 16 (TallUp)
 *
 * Account, preferences, app config with TallUp dark design.
 */
import { useState } from 'react'
import { View, ScrollView, Pressable, Switch, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { dark } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { logoutRevenueCat } from '@/lib/purchases'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useProfile } from '@/hooks/useProfile'
import { useLatestHeight } from '@/hooks/useHeightLogs'
import { queryClient } from '@/lib/queryClient'
import * as api from '@/lib/api/tallup'

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const { isPremium } = useSubscription()
  const { data: profile } = useProfile()
  const { data: latestHeight } = useLatestHeight()

  const [notifications, setNotifications] = useState(true)
  const [sleepReminder, setSleepReminder] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [goalHeight, setGoalHeight] = useState(profile?.goalHeightCm ?? 180)

  const handleLogout = async () => {
    track('logout')
    logoutRevenueCat()
    await supabase.auth.signOut()
  }

  async function handleGoalSave() {
    const user = (await supabase.auth.getUser()).data.user
    if (user) {
      await api.updateTallUpProfile(user.id, { goal_height_cm: goalHeight })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  }

  const firstName = profile?.fullName?.split(' ')[0] ?? 'User'
  const initials = profile?.initials ?? '??'
  const age = profile?.age ?? 16
  const currentHeight = latestHeight?.height_cm ?? 173

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={dark.textPrimary} />
          </Pressable>
          <Text style={s.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar + Profile summary */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{firstName}</Text>
            <Text style={s.profileDetail}>{age} years · {currentHeight} cm</Text>
          </View>
          {isPremium && (
            <View style={s.proBadge}>
              <Text style={s.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Measurement Unit */}
        <Section title="MEASUREMENT UNIT">
          <View style={s.segRow}>
            {(['cm', 'ft'] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => setUnit(u)}
                style={[s.segBtn, unit === u && { backgroundColor: dark.glowGreen }]}
              >
                <Text style={[s.segText, unit === u && { color: '#000' }]}>{u === 'cm' ? 'Centimeters' : 'Feet/Inches'}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* Theme */}
        <Section title="APPEARANCE">
          <View style={s.segRow}>
            {(['dark', 'light', 'system'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTheme(t as any)}
                style={[s.segBtn, theme === t && { backgroundColor: dark.glowGreen }]}
              >
                <Text style={[s.segText, theme === t && { color: '#000' }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* Notifications */}
        <Section title="NOTIFICATIONS">
          <SettingRow
            label="Routine Reminders"
            detail="Daily stretch/exercise notifications"
            value={notifications}
            onToggle={setNotifications}
          />
          <SettingRow
            label="Sleep Reminder"
            detail="Bedtime reminder for optimal GH window"
            value={sleepReminder}
            onToggle={setSleepReminder}
          />
          <SettingRow
            label="Weekly Report"
            detail="Sunday growth summary"
            value={weeklyReport}
            onToggle={setWeeklyReport}
          />
        </Section>

        {/* Height Goal */}
        <Section title="GOALS">
          <Pressable style={s.linkRow} onPress={handleGoalSave}>
            <View style={{ flex: 1 }}>
              <Text style={s.linkLabel}>Height Goal</Text>
              <Text style={s.linkDetail}>{goalHeight} cm — Tap to save</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={dark.textMuted} />
          </Pressable>
        </Section>

        {/* Account */}
        <Section title="ACCOUNT">
          <Pressable onPress={handleLogout} style={s.linkRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.linkLabel, { color: dark.glowRed }]}>Log Out</Text>
              <Text style={s.linkDetail}>Sign out of your account</Text>
            </View>
            <Ionicons name="log-out-outline" size={18} color={dark.glowRed} />
          </Pressable>
        </Section>
      </ScrollView>
    </View>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.title}>{title}</Text>
      <View style={sec.content}>{children}</View>
    </View>
  )
}

const sec = StyleSheet.create({
  wrap: { gap: 10, marginTop: 8 },
  title: {
    fontSize: 11, fontFamily: Fonts.bold,
    letterSpacing: 0.8, textTransform: 'uppercase',
    color: dark.textMuted, paddingHorizontal: 4,
  },
  content: {
    backgroundColor: dark.bgSurface,
    borderRadius: 16,
    borderWidth: 1, borderColor: dark.bgBorder,
    overflow: 'hidden',
  },
})

// ─── Setting Row ──────────────────────────────────────────────────────────

function SettingRow({
  label,
  detail,
  value,
  onToggle,
}: {
  label: string
  detail: string
  value: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <View style={sr.row}>
      <View style={{ flex: 1 }}>
        <Text style={sr.label}>{label}</Text>
        <Text style={sr.detail}>{detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: dark.bgBorder, true: dark.glowGreen }}
        thumbColor="#fff"
      />
    </View>
  )
}

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: dark.bgBorder,
  },
  label: { fontSize: 14, fontFamily: Fonts.medium, color: dark.textPrimary },
  detail: { fontSize: 11, color: dark.textMuted, marginTop: 2 },
})

// ─── Styles ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  scroll: { paddingHorizontal: 20, gap: 4 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontFamily: Fonts.bold, color: dark.textPrimary },

  // Profile card
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: dark.bgSurface,
    borderRadius: 16, borderWidth: 1, borderColor: dark.bgBorder,
    padding: 16, marginBottom: 8,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 999,
    backgroundColor: dark.glowGreen, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontFamily: Fonts.bold, color: '#000' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontFamily: Fonts.semibold, color: dark.textPrimary },
  profileDetail: { fontSize: 12, color: dark.textSecond, marginTop: 2 },
  proBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, backgroundColor: dark.glowPurple,
  },
  proBadgeText: { fontSize: 10, fontFamily: Fonts.bold, color: '#000' },

  // Segmented control
  segRow: { flexDirection: 'row', padding: 4, gap: 4 },
  segBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  segText: { fontSize: 13, fontFamily: Fonts.medium, color: dark.textPrimary },

  // Link row
  linkRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  linkLabel: { fontSize: 14, fontFamily: Fonts.medium, color: dark.textPrimary },
  linkDetail: { fontSize: 11, color: dark.textMuted, marginTop: 2 },
})