/**
 * Onboarding Carousel — Screen 1
 *
 * Full-bleed onboarding with 3 slides introducing TallUp's value prop.
 * Animates slide-in horizontal. Pagination dots + Skip/Next/Get Started.
 */
import { useRef, useState, useCallback } from 'react'
import { View, FlatList, Pressable, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts, TypeScale } from '@/lib/typography'

const { width: SW, height: SH } = Dimensions.get('window')

interface SlideData {
  id: string
  headline: React.ReactNode
  sub: string
  accent: string
}

// ─── Abstract illustration styles (declared first for component access) ─────

const abs = StyleSheet.create({
  shape: { width: 140, height: 200, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  circle: { width: 40, height: 40, borderRadius: 999, borderWidth: 2, position: 'absolute', top: 20 },
  lineV: { width: 2, height: 80, position: 'absolute', top: 65 },
  lineH: { width: 60, height: 2, position: 'absolute', top: 110, left: 20 },
  lineH2: { width: 80, height: 2, position: 'absolute', top: 140, left: 10 },
  triWrap: { flexDirection: 'row', gap: 16 },
  triCircle: { width: 60, height: 60, borderRadius: 999 },
  chartWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120 },
  chartBar: { width: 24, borderRadius: 8 },
})

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  skipWrap: { position: 'absolute', right: 20, zIndex: 20 },
  skipText: { fontSize: 14, color: dark.textMuted, fontFamily: Fonts.medium },
  slide: { width: SW, flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  illustration: { marginBottom: 48, alignItems: 'center', justifyContent: 'center' },
  textWrap: { alignItems: 'center', gap: 12 },
  slideHeadline: { fontSize: 28, fontFamily: Fonts.bold, lineHeight: 36, textAlign: 'center' },
  slideSub: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 280 },
  bottom: { paddingHorizontal: 24, gap: 24, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 999 },
  cta: { width: '100%', height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#000', fontSize: 16, fontFamily: Fonts.bold },
  signInWrap: { alignItems: 'center' },
  signInText: { fontSize: 13, color: dark.textMuted },
  signInLink: { fontWeight: '600' },
})

const SLIDES: SlideData[] = [
  {
    id: '1',
    headline: (
      <Text style={[styles.slideHeadline, { color: dark.glowGreen }]}>
        Track every{'\n'}centimeter.
      </Text>
    ),
    sub: 'Measure, log, and watch your growth unfold with precision.',
    accent: dark.glowGreen,
  },
  {
    id: '2',
    headline: (
      <Text style={styles.slideHeadline}>
        <Text style={{ color: dark.glowGreen }}>Train</Text>
        <Text style={{ color: dark.textPrimary }}>. </Text>
        <Text style={{ color: dark.glowBlue }}>Sleep</Text>
        <Text style={{ color: dark.textPrimary }}>. </Text>
        <Text style={{ color: dark.glowPurple }}>Grow</Text>
        <Text style={{ color: dark.textPrimary }}>.</Text>
      </Text>
    ),
    sub: 'Optimize the three pillars of natural height development.',
    accent: dark.glowBlue,
  },
  {
    id: '3',
    headline: (
      <Text style={[styles.slideHeadline, { color: dark.glowPurple }]}>
        Your growth,{'\n'}visualized.
      </Text>
    ),
    sub: 'AI-powered projections and beautiful charts show your journey.',
    accent: dark.glowPurple,
  },
]

export default function OnboardingCarousel() {
  const insets = useSafeAreaInsets()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const scrollX = useSharedValue(0)

  const isLast = currentIndex === SLIDES.length - 1

  const handleNext = useCallback(() => {
    if (isLast) {
      router.replace('/(auth)/login')
    } else {
      const next = currentIndex + 1
      flatListRef.current?.scrollToIndex({ index: next, animated: true })
      setCurrentIndex(next)
    }
  }, [currentIndex, isLast])

  const handleSkip = useCallback(() => {
    router.replace('/(auth)/login')
  }, [])

  const onScroll = useCallback((e: any) => {
    scrollX.value = e.nativeEvent.contentOffset.x
  }, [])

  const onMomentumEnd = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SW)
    setCurrentIndex(idx)
  }, [])

  return (
    <View style={styles.root}>
      {/* Skip button (top-right) */}
      <Animated.View
        entering={FadeIn.delay(400).duration(300)}
        style={[styles.skipWrap, { top: insets.top + 16 }]}
      >
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <Slide item={item} index={index} activeIndex={currentIndex} />
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom section */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={[styles.bottom, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Pagination dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                { backgroundColor: idx === currentIndex ? dark.glowGreen : dark.bgBorder },
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: dark.glowGreen, ...glowShadow(dark.glowGreen, 0.35) },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Text style={styles.ctaText}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>

        {/* Skip link at bottom (for last slide or as secondary) */}
        {isLast && (
          <Pressable onPress={handleSkip} hitSlop={8} style={styles.signInWrap}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
  <Text style={[styles.signInLink, { color: dark.glowGreen }]}>Sign in</Text>
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  )
}

// ─── Individual slide ──────────────────────────────────────────────────────

const Slide = ({
  item,
  index,
  activeIndex,
}: {
  item: SlideData
  index: number
  activeIndex: number
}) => {
  const isActive = index === activeIndex
  const scale = useSharedValue(isActive ? 1 : 0.8)
  const opacity = useSharedValue(isActive ? 1 : 0)

  // Animate when becoming active
  if (isActive) {
    scale.value = withSpring(1, { damping: 14, stiffness: 100 })
    opacity.value = withTiming(1, { duration: 400 })
  } else {
    scale.value = withTiming(0.88)
    opacity.value = withTiming(0.3)
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <View style={styles.slide}>
      {/* Abstract illustration */}
      <Animated.View style={[styles.illustration, animStyle]}>
        <AbstractShape accent={item.accent} slideId={item.id} />
      </Animated.View>

      {/* Text content */}
      <View style={styles.textWrap}>
        {item.headline}
        <Text style={[styles.slideSub, { color: dark.textSecond }]}>{item.sub}</Text>
      </View>
    </View>
  )
}

// ─── Abstract illustration per slide ───────────────────────────────────────

const AbstractShape = ({ accent, slideId }: { accent: string; slideId: string }) => {
  if (slideId === '1') {
    // Human silhouette abstraction — vertical lines + circle
    return (
      <View style={[abs.shape, { borderColor: accent }]}>
        <View style={[abs.circle, { borderColor: accent }]} />
        <View style={[abs.lineV, { backgroundColor: accent }]} />
        <View style={[abs.lineH, { backgroundColor: accent }]} />
        <View style={[abs.lineH2, { backgroundColor: accent }]} />
      </View>
    )
  }
  if (slideId === '2') {
    // Three colored circles for train/sleep/grow
    return (
      <View style={abs.triWrap}>
        <View style={[abs.triCircle, { backgroundColor: dark.glowGreen, ...glowShadow(dark.glowGreen, 0.25) }]} />
        <View style={[abs.triCircle, { backgroundColor: dark.glowBlue, ...glowShadow(dark.glowBlue, 0.25) }]} />
        <View style={[abs.triCircle, { backgroundColor: dark.glowPurple, ...glowShadow(dark.glowPurple, 0.25) }]} />
      </View>
    )
  }
  // Slide 3 — chart abstraction
  return (
    <View style={abs.chartWrap}>
      <View style={[abs.chartBar, { height: 40, backgroundColor: dark.glowGreen }]} />
      <View style={[abs.chartBar, { height: 60, backgroundColor: dark.glowGreen }]} />
      <View style={[abs.chartBar, { height: 80, backgroundColor: dark.glowGreen }]} />
      <View style={[abs.chartBar, { height: 50, backgroundColor: dark.glowPurple }]} />
      <View style={[abs.chartBar, { height: 100, backgroundColor: dark.glowPurple }]} />
      <View style={[abs.chartBar, { height: 70, backgroundColor: dark.glowPurple }]} />
    </View>
  )
}

// (styles moved above)
