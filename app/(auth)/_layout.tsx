import { Stack } from 'expo-router'
import { dark } from '@/lib/theme'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_bottom', contentStyle: { backgroundColor: dark.bgBase } }}>
      <Stack.Screen name="login" />
    </Stack>
  )
}
