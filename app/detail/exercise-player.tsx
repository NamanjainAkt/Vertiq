import { useState, useEffect, useRef } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'

export default function ExercisePlayerScreen() {
  const insets = useSafeAreaInsets()
  const { name, step, total, icon, color } = useLocalSearchParams<{
    name: string
    step: string
    total: string
    icon: string
    color: string
  }>()

  const [countdown, setCountdown] = useState(30)
  const [isPlaying, setIsPlaying] = useState(true)
  const intervalRef = useRef<number | null>(null)

  const glowPulse = useSharedValue(0.15)

  useEffect(() => {
    glowPulse.value = withRepeat(
      withTiming(0.6, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [])

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }))

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  const togglePlay = () => setIsPlaying(prev => !prev)

  const exerciseColor = color || dark.glowGreen
  const exerciseIcon = icon || 'fitness'
  const currentStep = parseInt(step || '1', 10)
  const totalSteps = parseInt(total || '1', 10)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <View style={[s.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[s.bgGlow, { backgroundColor: exerciseColor }, pulseStyle]} />

      <View style={s.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={dark.textPrimary} />
        </Pressable>
        <Text style={s.exerciseName} numberOfLines={1}>{name || 'Exercise'}</Text>
        <Text style={s.stepIndicator}>{currentStep} / {totalSteps}</Text>
      </View>

      <View style={s.centerArea}>
        <View style={s.illustrationWrap}>
          <View style={[s.illustrationRing, { borderColor: exerciseColor }]}>
            <View
              style={[
                s.illustrationGlow,
                { backgroundColor: exerciseColor },
                glowShadow(exerciseColor, 0.5),
              ]}
            />
            <Ionicons name={exerciseIcon as any} size={64} color={exerciseColor} />
          </View>
        </View>
      </View>

      <View style={s.timerSection}>
        <Text style={[s.timerText, { color: dark.glowGreen }]}>
          {formatTime(countdown)}
        </Text>
        <Pressable onPress={togglePlay} hitSlop={12}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={32}
            color={dark.glowGreen}
          />
        </Pressable>
      </View>

      <View style={s.bottomRow}>
        <Pressable style={s.bottomBtn}>
          <Text style={s.bottomBtnText}>Skip</Text>
        </Pressable>
        <Pressable style={[s.bottomBtn, s.restBtn]}>
          <Text style={[s.bottomBtnText, { color: dark.glowGreen }]}>Rest (15s)</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={s.bottomBtn}>
          <Text style={[s.bottomBtnText, { color: dark.glowGreen }]}>Done ✓</Text>
        </Pressable>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: dark.bgBase,
  },
  bgGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exerciseName: {
    flex: 1,
    color: dark.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  stepIndicator: {
    color: dark.textSecond,
    fontSize: 13,
    fontWeight: '600',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.15,
  },
  timerSection: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 40,
  },
  timerText: {
    fontFamily: Fonts.display,
    fontSize: 64,
    lineHeight: 70,
    textShadowColor: dark.glowGreen,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  bottomBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: dark.bgBorder,
    backgroundColor: dark.bgElevated,
  },
  restBtn: {
    borderColor: 'rgba(0,255,135,0.3)',
  },
  bottomBtnText: {
    color: dark.textSecond,
    fontSize: 14,
    fontWeight: '600',
  },
})
