import { View, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { Text } from '@/components/ui/Text'
import { dark } from '@/lib/theme'
import { Fonts } from '@/lib/typography'

interface ProgressRingProps {
  progress: number    // 0–100
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  centerValue?: string
  centerLabel?: string
}

/**
 * Circular SVG progress ring with center value.
 * Uses react-native-svg.
 */
export function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  color = dark.glowGreen,
  trackColor = dark.bgBorder,
  centerValue,
  centerLabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {centerValue && (
        <View style={styles.center}>
          <Text style={[styles.value, { fontFamily: Fonts.display }]}>{centerValue}</Text>
          {centerLabel && <Text style={styles.label}>{centerLabel}</Text>}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    color: dark.textPrimary,
    lineHeight: 28,
  },
  label: {
    fontSize: 10,
    color: dark.textSecond,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
})
