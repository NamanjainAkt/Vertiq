import { View, StyleSheet, type ViewProps } from 'react-native'
import { dark, glowShadow } from '@/lib/theme'

type GlowColor = 'green' | 'blue' | 'purple' | 'red' | 'amber'

interface GlowCardProps extends ViewProps {
  glow?: GlowColor
  /** Tighter padding */
  compact?: boolean
}

const GLOW_MAP: Record<GlowColor, string> = {
  green:  dark.glowGreen,
  blue:   dark.glowBlue,
  purple: dark.glowPurple,
  red:    dark.glowRed,
  amber:  '#E07B00',
}

/**
 * GlowCard — TallUp's signature card with colored glow shadow.
 * Used across Dashboard, Sleep, Nutrition, and Projection screens.
 */
export function GlowCard({ glow = 'green', compact, style, children, ...rest }: GlowCardProps) {
  const color = GLOW_MAP[glow]
  return (
    <View
      style={[
        styles.card,
        glowShadow(color, 0.35),
        compact ? styles.compact : styles.normal,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:  dark.bgSurface,
    borderRadius:     16,
    borderWidth:      1,
    borderColor:      dark.bgBorder,
  },
  normal:  { padding: 16 },
  compact: { padding: 10 },
})
