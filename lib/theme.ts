/**
 * TallUp Design System — Color Tokens
 *
 * Dark-first biometric dashboard. See design.md for full spec.
 */

// ── Dark Mode ───────────────────────────────────────────────────────────────

export const dark = {
  // Backgrounds
  bgBase:      '#000000',
  bgSurface:   '#0A0A0A',
  bgElevated:  '#111111',
  bgBorder:    '#1A1A1A',
  bgMuted:     '#222222',

  // Glowing Accents
  glowGreen:   '#00FF87',
  glowGreenDim:'#00C96A',
  glowBlue:    '#00BFFF',
  glowBlueDim: '#0091CC',
  glowPurple:  '#B44FFF',
  glowPurpleDim:'#8A35D4',
  glowRed:     '#FF3D5A',
  glowRedDim:  '#CC2844',

  // Text
  textPrimary: '#FFFFFF',
  textSecond:  '#A0A0A0',
  textMuted:   '#555555',
}

// ── Light Mode ──────────────────────────────────────────────────────────────

export const light = {
  bgBase:      '#F4F6F9',
  bgSurface:   '#FFFFFF',
  bgElevated:  '#FFFFFF',
  bgBorder:    '#E2E6EC',
  bgMuted:     '#EDF0F4',

  accentGreen:  '#00A35C',
  accentBlue:   '#006FD6',
  accentPurple: '#7B2FBE',
  accentRed:    '#D92D47',
  accentAmber:  '#E07B00',

  textPrimary: '#0D1117',
  textSecond:  '#4B5563',
  textMuted:   '#9CA3AF',
}

// ── Current theme (dark-first) — swap these when adding light mode ──────────

/** Main app background */
export const BG = dark.bgBase
/** Card / sheet surfaces */
export const SURFACE = dark.bgSurface
/** Modals, bottom sheets */
export const SURFACE2 = dark.bgElevated
/** Dividers, input borders */
export const BORDER = dark.bgBorder
/** Disabled / subtle fills */
export const SURFACE3 = dark.bgMuted

// Accents
export const ACCENT = dark.glowGreen
export const ACCENT_DIM = dark.glowGreenDim
export const ACCENT_BLUE = dark.glowBlue
export const ACCENT_PURPLE = dark.glowPurple
export const ACCENT_RED = dark.glowRed

// Derived
export const ACCENT_DIM_BG = 'rgba(0,255,135,0.10)' as string
export const ACCENT_BORDER = 'rgba(0,255,135,0.25)' as string
export const ACCENT_GLOW = 'rgba(0,255,135,0.20)' as string

// Text
export const TEXT_PRIMARY = dark.textPrimary
export const TEXT_SECONDARY = dark.textSecond
export const TEXT_TERTIARY = dark.textMuted
export const TEXT_DISABLED = '#333333'

// Semantic
export const ERROR = dark.glowRed
export const ERROR_DIM = 'rgba(255,61,90,0.12)' as string
export const WARNING = '#E07B00'
export const SUCCESS = dark.glowGreen

// Tab bar
export const TAB_ACTIVE = dark.glowGreen
export const TAB_INACTIVE = dark.textMuted
export const TAB_HEIGHT = 80

// ── Glow shadow helper (dark mode only) ────────────────────────────────────

export const glowShadow = (color: string, intensity = 0.35) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: intensity,
  shadowRadius: 20,
  elevation: 10,
})
