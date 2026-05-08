import React, { useEffect } from 'react'
import { View, Pressable, StyleSheet, Platform } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { dark } from '@/lib/theme'
import { Text } from '@/components/ui/Text'
import { Fonts } from '@/lib/typography'

const ICON_SIZE = 24
const EASE_OUT = Easing.out(Easing.cubic)
const EASE_IN = Easing.in(Easing.cubic)

export const TAB_BAR_HEIGHT = 80
export const TAB_BAR_CLEARANCE = 84

// ─── Single tab item ──────────────────────────────────────────────────────────

function TabItem({
  label,
  isActive,
  onPress,
  icon,
}: {
  label: string
  isActive: boolean
  onPress: () => void
  icon?: React.ReactNode
}) {
  const pressOpacity = useSharedValue(1)

  return (
    <Pressable
      style={s.tab}
      onPress={onPress}
      onPressIn={() => { pressOpacity.value = withTiming(0.45, { duration: 70 }) }}
      onPressOut={() => { pressOpacity.value = withTiming(1, { duration: 160, easing: EASE_OUT }) }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={[s.tabInner, { opacity: pressOpacity }]}>
        {icon}
        {/* Only show label when active (TallUp spec) */}
        {isActive && (
          <Text style={s.labelActive} numberOfLines={1}>
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  )
}

// ─── TabBar ───────────────────────────────────────────────────────────────────

export default function TabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  function handlePress(name: string, key: string, i: number) {
    if (state.index === i) return
    const ev = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true })
    if (!ev.defaultPrevented) navigation.navigate(name as never)
  }

  const tabs = (
    <View style={s.bar}>
      {state.routes.map((route, i) => {
        const { options } = descriptors[route.key]
        const isActive = state.index === i
        const label = typeof options.tabBarLabel === 'string'
          ? options.tabBarLabel
          : (options.title ?? route.name)
        const icon = options.tabBarIcon?.({
          color: isActive ? dark.glowGreen : dark.textMuted,
          size: ICON_SIZE,
          focused: isActive,
        })

        return (
          <TabItem
            key={route.key}
            label={label}
            isActive={isActive}
            icon={icon}
            onPress={() => handlePress(route.name, route.key, i)}
          />
        )
      })}
    </View>
  )

  if (Platform.OS === 'ios') {
    return (
      <View style={s.wrapper}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={s.overlay} />
        {tabs}
        {insets.bottom > 0 && (
          <View style={{ height: insets.bottom, backgroundColor: 'transparent' }} />
        )}
      </View>
    )
  }

  return (
    <View style={[s.wrapper, s.wrapperAndroid]}>
      {tabs}
      {insets.bottom > 0 && (
        <View style={{ height: insets.bottom, backgroundColor: dark.bgBase }} />
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 12,
    elevation: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: dark.bgBorder,
  },
  wrapperAndroid: { backgroundColor: dark.bgBase },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  bar: {
    flexDirection: 'row', height: TAB_BAR_HEIGHT, alignItems: 'stretch',
    backgroundColor: dark.bgBase,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  labelActive: {
    fontSize: 10,
    color: dark.glowGreen,
    fontFamily: Fonts.semibold,
    textAlign: 'center',
  },
})
