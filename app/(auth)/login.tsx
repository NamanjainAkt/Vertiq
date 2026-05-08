/**
 * Sign Up / Login — Screen 2 (TallUp)
 *
 * Segmented control: Sign Up | Log In
 * OTP-based auth flow wrapped in TallUp design system.
 * Keeps Supabase auth + disposable email blocklist + lockout from original.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Pressable, StyleSheet, Dimensions,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  TextInput as RNTextInput, ScrollView, DeviceEventEmitter,
} from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { Text } from '@/components/ui/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { APP_SCHEME } from '@/lib/constants'
import { Ionicons } from '@expo/vector-icons'

WebBrowser.maybeCompleteAuthSession()

const DEV_ALLOW_SKIP = __DEV__

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'yopmail.com', 'trashmail.com', 'trashmail.me', 'maildrop.cc',
  'mailnesia.com', 'discard.email', 'throwaway.email', 'getnada.com', 'fakeinbox.com',
  'getairmail.com', 'spam4.me', 'spamgourmet.com', 'dispostable.com', 'filzmail.com',
])

type AuthMode = 'signup' | 'login'

function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase()
  const atIdx = trimmed.lastIndexOf('@')
  if (atIdx === -1) return trimmed
  const local = trimmed.slice(0, atIdx)
  const domain = trimmed.slice(atIdx + 1)
  const cleanLocal = local.split('+')[0]
  const gmailDomains = ['gmail.com', 'googlemail.com']
  const finalLocal = gmailDomains.includes(domain) ? cleanLocal.replace(/\./g, '') : cleanLocal
  return `${finalLocal}@${domain}`
}

export default function AuthScreen() {
  const insets = useSafeAreaInsets()

  const [mode, setMode] = useState<AuthMode>('signup')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null)
  const [lockoutLeft, setLockoutLeft] = useState(0)

  const otpRefs = useRef<(RNTextInput | null)[]>([])
  const emailRef = useRef<RNTextInput>(null)

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Lockout countdown
  useEffect(() => {
    if (!lockoutEnd) return
    const tick = () => {
      const rem = Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000))
      setLockoutLeft(rem)
      if (rem === 0) setLockoutEnd(null)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [lockoutEnd])

  const handleSendOtp = async () => {
    const normalized = normalizeEmail(email)
    if (!normalized || !normalized.includes('@') || !normalized.includes('.')) {
      setError('Enter a valid email address')
      return
    }
    const domain = normalized.split('@')[1]
    if (DISPOSABLE_DOMAINS.has(domain)) {
      setError('Temporary email addresses are not allowed.')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name')
      return
    }
    setLoading(true); setError(null)
    track(mode === 'signup' ? 'signup_started' : 'login_started')
    const { error: err } = await supabase.auth.signInWithOtp({ email: normalized })
    setLoading(false)
    if (err) { setError(err.message); return }
    track('otp_sent')
    setStep('otp')
    setCooldown(60)
    setTimeout(() => otpRefs.current[0]?.focus(), 300)
  }

  const handleVerifyOtp = useCallback(async (code: string) => {
    if (code.length < 6) return
    if (lockoutEnd && Date.now() < lockoutEnd) {
      setError(`Too many attempts. Wait ${Math.ceil((lockoutEnd - Date.now()) / 60000)} minute(s).`)
      return
    }
    setLoading(true); setError(null)
    const { error: err } = await supabase.auth.verifyOtp({
      email: normalizeEmail(email),
      token: code,
      type: 'email',
    })
    setLoading(false)
    if (err) {
      const next = failedAttempts + 1
      setFailedAttempts(next)
      if (next >= 5) {
        setLockoutEnd(Date.now() + 15 * 60 * 1000)
        setError('Too many failed attempts. Please wait 15 minutes.')
      } else {
        setError(`Invalid code. ${5 - next} attempt${5 - next === 1 ? '' : 's'} left.`)
      }
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
      return
    }
    track('auth_success')

    // If signup, save name
    if (mode === 'signup' && name.trim()) {
      await supabase.auth.updateUser({
        data: { full_name: name.trim(), onboarding_completed: false },
      })
    }
    // _layout.tsx auth guard handles navigation
  }, [email, lockoutEnd, failedAttempts, mode, name])

  const handleOtpChange = (val: string, index: number) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
    const code = next.join('')
    if (code.length === 6 && !next.includes('')) handleVerifyOtp(code)
  }

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp]
      next[index - 1] = ''
      setOtp(next)
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setLoading(true); setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({ email: normalizeEmail(email) })
    setLoading(false)
    if (err) { setError(err.message); return }
    setCooldown(60)
    setOtp(['', '', '', '', '', ''])
    setTimeout(() => otpRefs.current[0]?.focus(), 50)
  }

  const goBack = () => {
    setStep('email'); setOtp(['', '', '', '', '', ''])
    setError(null); setFailedAttempts(0); setLockoutEnd(null)
  }

  const handleDevSkip = () => {
    DeviceEventEmitter.emit('__dev_skip_auth__')
  }

  async function handleOAuthLogin(provider: 'google' | 'apple') {
    setLoading(true); setError(null)
    try {
      const redirectTo = `${APP_SCHEME}://auth/callback`
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (err) throw err
      if (!data.url) throw new Error('No OAuth URL returned.')
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type === 'success') {
        const { error: sessionErr } = await supabase.auth.exchangeCodeForSession(result.url)
        if (sessionErr) throw sessionErr
      }
    } catch (e: any) {
      setError(e?.message ?? `${provider} sign-in failed.`)
    } finally { setLoading(false) }
  }

  const SegControl = () => (
    <View style={s.segControl}>
      {(['signup', 'login'] as AuthMode[]).map((m) => (
        <Pressable
          key={m}
          onPress={() => { setMode(m); setError(null) }}
          style={[s.segBtn, mode === m && s.segBtnActive]}
        >
          <Text style={[s.segText, mode === m && s.segTextActive]}>
            {m === 'signup' ? 'Sign Up' : 'Log In'}
          </Text>
        </Pressable>
      ))}
    </View>
  )

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[s.form, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.content}>
            {/* TallUp wordmark */}
            <Text style={s.wordmark}>TallUp</Text>
            <Text style={s.tagline}>Grow with intention.</Text>

            <SegControl />

            {step === 'email' ? (
              /* ── Email step ── */
              <View style={s.stepWrap}>
                {mode === 'signup' && (
                  <View style={s.fieldGroup}>
                    <Text style={s.label}>YOUR NAME</Text>
                    <RNTextInput
                      value={name}
                      onChangeText={(v) => { setName(v); setError(null) }}
                      placeholder="Enter your name"
                      placeholderTextColor={dark.textMuted}
                      style={s.input}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                )}

                <View style={s.fieldGroup}>
                  <Text style={s.label}>EMAIL ADDRESS</Text>
                  <RNTextInput
                    ref={emailRef}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setError(null) }}
                    placeholder="you@example.com"
                    placeholderTextColor={dark.textMuted}
                    style={s.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSendOtp}
                    autoFocus
                  />
                </View>

                {error ? <ErrorBanner msg={error} /> : null}

                <Pressable
                  onPress={handleSendOtp}
                  disabled={loading || !email.trim()}
                  style={({ pressed }) => [s.btnContainer, (loading || !email.trim()) && { opacity: 0.4 }, pressed && { opacity: 0.85 }]}
                >
                  <View style={[s.primaryBtn, { backgroundColor: dark.glowGreen }, glowShadow(dark.glowGreen, 0.35)]}>
                    {loading
                      ? <ActivityIndicator size="small" color="#000" />
                      : <Text style={s.primaryBtnText}>Continue →</Text>
                    }
                  </View>
                </Pressable>

                {/* Social logins */}
                <View style={s.dividerRow}>
                  <View style={s.dividerLine} />
                  <Text style={s.dividerText}>or continue with</Text>
                  <View style={s.dividerLine} />
                </View>

                <View style={s.socialRow}>
                  <Pressable onPress={() => handleOAuthLogin('google')} style={({ pressed }) => [s.socialBtn, pressed && { opacity: 0.75 }]}>
                    <Ionicons name="logo-google" size={17} color={dark.textPrimary} />
                    <Text style={s.socialBtnText}>Google</Text>
                  </Pressable>
                  <Pressable onPress={() => handleOAuthLogin('apple')} style={({ pressed }) => [s.socialBtn, pressed && { opacity: 0.75 }]}>
                    <Ionicons name="logo-apple" size={17} color={dark.textPrimary} />
                    <Text style={s.socialBtnText}>Apple</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* ── OTP step ── */
              <View style={s.stepWrap}>
                <Text style={s.otpTitle}>Check your inbox</Text>
                <View style={s.emailPill}>
                  <Text style={s.emailPillText} numberOfLines={1}>{normalizeEmail(email)}</Text>
                </View>
                <Text style={s.otpSub}>Enter the 6-digit code we sent.</Text>

                <View style={s.otpRow}>
                  {otp.map((digit, i) => (
                    <RNTextInput
                      key={i}
                      ref={(r) => { otpRefs.current[i] = r }}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(v, i)}
                      onKeyPress={(e) => handleOtpKeyPress(e, i)}
                      style={[s.otpBox, digit ? { borderColor: dark.glowGreen, backgroundColor: 'rgba(0,255,135,0.08)' } : null]}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      caretHidden
                      editable={!loading}
                    />
                  ))}
                </View>

                {error ? <ErrorBanner msg={error} /> : null}

                {lockoutEnd ? (
                  <View style={s.lockoutBox}>
                    <Text style={s.lockoutText}>
                      Locked · {Math.floor(lockoutLeft / 60)}:{String(lockoutLeft % 60).padStart(2, '0')}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={() => handleVerifyOtp(otp.join(''))}
                  disabled={loading || otp.includes('') || !!lockoutEnd}
                  style={({ pressed }) => [s.btnContainer, (loading || otp.includes('') || !!lockoutEnd) && { opacity: 0.4 }, pressed && { opacity: 0.85 }]}
                >
                  <View style={[s.primaryBtn, { backgroundColor: dark.glowGreen }, glowShadow(dark.glowGreen, 0.35)]}>
                    {loading
                      ? <ActivityIndicator size="small" color="#000" />
                      : <Text style={s.primaryBtnText}>Verify Code</Text>
                    }
                  </View>
                </Pressable>

                <View style={s.otpMeta}>
                  <Pressable onPress={handleResend} disabled={cooldown > 0} hitSlop={10}>
                    <Text style={[s.resendText, cooldown > 0 && { color: dark.textMuted }]}>
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                    </Text>
                  </Pressable>
                  <Text style={{ color: dark.textMuted }}>·</Text>
                  <Pressable onPress={goBack} hitSlop={10}>
                    <Text style={{ color: dark.textSecond, fontSize: 13 }}>Change email</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Dev skip */}
            {DEV_ALLOW_SKIP && (
              <Pressable onPress={handleDevSkip} style={({ pressed }) => [s.devSkip, pressed && { opacity: 0.6 }]}>
                <Text style={s.devSkipText}>Skip to Home (dev)</Text>
              </Pressable>
            )}

            {/* Legal */}
            <View style={s.legalRow}>
              <Pressable onPress={() => router.push('/privacy')} hitSlop={8}>
                <Text style={s.legalLink}>Privacy Policy</Text>
              </Pressable>
              <Text style={s.legalDot}>·</Text>
              <Pressable onPress={() => router.push('/terms')} hitSlop={8}>
                <Text style={s.legalLink}>Terms of Service</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <Animated.View entering={FadeIn.duration(180)} style={s.errorBox}>
      <Text style={s.errorText}>{msg}</Text>
    </Animated.View>
  )
}

const { width: SW } = Dimensions.get('window')

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: dark.bgBase },
  kav: { flex: 1 },
  form: { flexGrow: 1, paddingHorizontal: 24 },
  content: { flex: 1, gap: 0 },

  // Wordmark
  wordmark: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: dark.glowGreen,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 38,
  },
  tagline: {
    fontSize: 13,
    color: dark.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },

  // Segmented control
  segControl: {
    flexDirection: 'row',
    backgroundColor: dark.bgElevated,
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: dark.glowGreen,
  },
  segText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: dark.textMuted,
  },
  segTextActive: {
    color: '#000',
    fontFamily: Fonts.bold,
  },

  // Step wrapper
  stepWrap: { gap: 16 },

  // Fields
  fieldGroup: { gap: 8 },
  label: {
    fontSize: 11, fontFamily: Fonts.bold,
    letterSpacing: 0.8, textTransform: 'uppercase',
    color: dark.textMuted,
  },
  input: {
    height: 52,
    backgroundColor: dark.bgElevated,
    borderWidth: 1,
    borderColor: dark.bgBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: dark.textPrimary,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },

  // Button
  btnContainer: { borderRadius: 999, overflow: 'hidden' },
  primaryBtn: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  primaryBtnText: { color: '#000', fontSize: 15, fontFamily: Fonts.bold },

  // Social
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: dark.bgBorder },
  dividerText: { fontSize: 12, color: dark.textMuted },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 50, backgroundColor: dark.bgSurface, borderRadius: 14,
    borderWidth: 1, borderColor: dark.bgBorder,
  },
  socialBtnText: { color: dark.textPrimary, fontSize: 14, fontFamily: Fonts.medium },

  // OTP
  otpTitle: { fontSize: 20, fontFamily: Fonts.bold, color: dark.textPrimary, textAlign: 'center' },
  otpSub: { fontSize: 13, color: dark.textSecond, textAlign: 'center' },
  emailPill: { alignSelf: 'center', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(0,255,135,0.08)', borderWidth: 1, borderColor: 'rgba(0,255,135,0.2)' },
  emailPillText: { fontSize: 13, color: dark.glowGreen, fontFamily: Fonts.medium },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  otpBox: {
    flex: 1, height: 56, backgroundColor: dark.bgElevated,
    borderWidth: 1, borderColor: dark.bgBorder, borderRadius: 12,
    color: dark.textPrimary, fontSize: 22, textAlign: 'center',
    textAlignVertical: 'center', paddingVertical: 0, paddingHorizontal: 0,
    includeFontPadding: false, fontFamily: Fonts.regular,
  },
  otpMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  resendText: { color: dark.glowGreen, fontSize: 13, fontFamily: Fonts.medium },

  // Error
  errorBox: { backgroundColor: 'rgba(255,61,90,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,61,90,0.2)', paddingHorizontal: 12, paddingVertical: 10 },
  errorText: { color: dark.glowRed, fontSize: 12.5 },

  // Lockout
  lockoutBox: { backgroundColor: 'rgba(224,123,0,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(224,123,0,0.2)', paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  lockoutText: { color: '#E07B00', fontSize: 13, fontFamily: Fonts.bold },

  // Dev skip
  devSkip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'center', marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  devSkipText: { fontSize: 12, color: dark.textSecond, fontFamily: Fonts.medium },

  // Legal
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'auto', paddingTop: 24 },
  legalLink: { fontSize: 11, color: dark.textMuted, textDecorationLine: 'underline' },
  legalDot: { fontSize: 11, color: dark.textMuted },
})
