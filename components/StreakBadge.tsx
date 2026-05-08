import { View, StyleSheet } from 'react-native'
import { dark } from '@/lib/theme'

interface StreakBadgeProps {
  filled?: boolean
  missed?: boolean
  today?: boolean
  label?: string
}

/**
 * StreakBadge — 40px circle for the daily streak strip.
 * Filled = green, missed = red, future = muted.
 */
export function StreakBadge({ filled, missed, today, label }: StreakBadgeProps) {
  const isActive = filled || today
  return (
    <View style={[styles.badge, isActive && styles.active, missed && styles.missed]}>
      {label && <View style={styles.labelWrap}><>{label}</></View>}
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: dark.bgBorder,
    borderWidth: 1,
    borderColor: dark.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: 'rgba(0,255,135,0.10)',
    borderColor: dark.glowGreen,
  },
  missed: {
    backgroundColor: 'rgba(255,61,90,0.10)',
    borderColor: dark.glowRed,
  },
  labelWrap: {
    // placeholder for day letter
  },
})
