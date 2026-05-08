/**
 * TallUp Typography System
 *
 * Font families:
 *   - Bebas Neue (display / hero numbers)
 *   - Plus Jakarta Sans (headings, body, labels)
 *   - JetBrains Mono (data values, chart axis)
 *
 * These names must match the font keys loaded in app/_layout.tsx.
 */

export const Fonts = {
  // Display
  display: 'BebasNeue',          // 400 — loaded from assets/fonts/

  // Primary UI
  regular:    'PlusJakartaSans_400Regular',
  medium:     'PlusJakartaSans_500Medium',
  semibold:   'PlusJakartaSans_600SemiBold',
  bold:       'PlusJakartaSans_700Bold',
  extrabold:  'PlusJakartaSans_800ExtraBold',

  // Mono
  mono:  'JetBrainsMono_400Regular',
  monoBold:   'JetBrainsMono_700Bold',
}

/**
 * Map a fontWeight value to the matching font family name.
 */
export function weightToFamily(weight?: string | number | null): string | undefined {
  switch (String(weight ?? '400')) {
    case '500': return Fonts.medium
    case '600': return Fonts.semibold
    case '700':
    case 'bold': return Fonts.bold
    case '800':
    case '900': return Fonts.extrabold
    default: return Fonts.regular
  }
}

/**
 * Type scale — consistent size/lineHeight pairs matching design.md spec.
 */
export const TypeScale = {
  displayXl: { fontFamily: Fonts.display, fontSize: 56, lineHeight: 62 },   // hero height readout
  displayLg: { fontFamily: Fonts.display, fontSize: 40, lineHeight: 44 },   // chart peak values
  h1:        { fontFamily: Fonts.bold,    fontSize: 28, lineHeight: 36 },   // page titles
  h2:        { fontFamily: Fonts.semibold,fontSize: 22, lineHeight: 28 },   // section headings
  h3:        { fontFamily: Fonts.semibold,fontSize: 18, lineHeight: 24 },   // card headings
  bodyLg:    { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },   // body text
  bodyMd:    { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },   // secondary body
  label:     { fontFamily: Fonts.medium,  fontSize: 12, lineHeight: 16, letterSpacing: 0.96 },  // UPPERCASE labels
  caption:   { fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16 },   // captions
  monoLg:    { fontFamily: Fonts.mono,    fontSize: 20, lineHeight: 26 },   // data values
  monoSm:    { fontFamily: Fonts.mono,    fontSize: 13, lineHeight: 18 },   // chart axis, timestamps
} as const
