# TallUp — Height Optimization App
## Design System & Screen Architecture

---

## 01. App Overview

**Product Name:** TallUp  
**Tagline:** *Grow with intention.*  
**Target Users:** Teens & young adults (13–25), health-focused, mobile-native  
**Aesthetic Direction:** Dark-first biometric dashboard — clinical precision meets athletic energy. Black as the canvas, neon biometric glows for data layers. Light mode is clean medical-grade white with saturated accent ink.

---

## 02. Screen Count & Architecture

**Total Screens: 16**

### Auth Flow (3 screens)
1. Splash / Onboarding Carousel
2. Sign Up / Login
3. Profile Setup (age, gender, current height, goal)

### Core Tab Navigation (5 main tabs)
4. Dashboard (Home)
5. Measurements & Growth Chart
6. Daily Routine
7. Sleep Tracker
8. Nutrition Hub

### Secondary / Detail Screens (8 screens)
9. Routine Detail (exercise/stretch breakdown)
10. Exercise Player (step-by-step with timer)
11. Log Height Entry
12. Growth Projection Screen
13. Sleep Log Detail
14. Nutrition Detail (tip deep-dive)
15. Streak & Achievements
16. Settings & Profile

---

## 03. Color System

### Dark Mode Palette (Primary)

```
Background Layers
─────────────────────────────────────────────────
bg-base        #000000   Pure black canvas
bg-surface     #0A0A0A   Card / sheet surfaces
bg-elevated    #111111   Modals, bottom sheets
bg-border      #1A1A1A   Dividers, input borders
bg-muted       #222222   Disabled / subtle fills

Glowing Accent System
─────────────────────────────────────────────────
glow-green     #00FF87   Growth / positive metrics (primary CTA)
glow-green-dim #00C96A   Secondary green actions
glow-blue      #00BFFF   Sleep / recovery data
glow-blue-dim  #0091CC   Secondary blue
glow-purple    #B44FFF   Projections / AI insights
glow-purple-dim #8A35D4  Secondary purple
glow-red       #FF3D5A   Alerts / missed streaks
glow-red-dim   #CC2844   Secondary red

Text
─────────────────────────────────────────────────
text-primary   #FFFFFF   Headings, key values
text-secondary #A0A0A0   Labels, subtitles
text-muted     #555555   Placeholders, captions

Glow Effects (box-shadow / elevation)
─────────────────────────────────────────────────
shadow-green   0 0 20px rgba(0,255,135,0.35)
shadow-blue    0 0 20px rgba(0,191,255,0.35)
shadow-purple  0 0 20px rgba(180,79,255,0.35)
shadow-red     0 0 20px rgba(255,61,90,0.35)
```

### Light Mode Palette

```
Background Layers
─────────────────────────────────────────────────
bg-base        #F4F6F9   Cool off-white, clinical
bg-surface     #FFFFFF   Cards, sheets
bg-elevated    #FFFFFF   Modals
bg-border      #E2E6EC   Dividers
bg-muted       #EDF0F4   Input fills, disabled

Accent System (saturated, ink-like — no glows)
─────────────────────────────────────────────────
accent-green   #00A35C   Growth / CTAs
accent-blue    #006FD6   Sleep / recovery
accent-purple  #7B2FBE   Projections
accent-red     #D92D47   Alerts
accent-amber   #E07B00   Nutrition

Text
─────────────────────────────────────────────────
text-primary   #0D1117   Near-black
text-secondary #4B5563   Mid-gray labels
text-muted     #9CA3AF   Captions, placeholders
```

---

## 04. Typography

```
Display / Hero Numbers  → "Bebas Neue"   (height values, big stats)
Headings & Section      → "Plus Jakarta Sans" 700/600
Body & Labels           → "Plus Jakarta Sans" 400/500
Monospace (data values) → "JetBrains Mono" (chart axis, timestamps)

Scale
──────────────────────────────
display-xl    56px / Bebas Neue     (hero height readout)
display-lg    40px / Bebas Neue     (chart peak values)
heading-1     28px / Jakarta 700
heading-2     22px / Jakarta 600
heading-3     18px / Jakarta 600
body-lg       16px / Jakarta 400
body-md       14px / Jakarta 400
label         12px / Jakarta 500 / UPPERCASE + tracking 0.08em
caption       11px / Jakarta 400
mono-lg       20px / JetBrains Mono
mono-sm       13px / JetBrains Mono
```

---

## 05. Spacing & Grid

```
Base unit: 4px

Spacing tokens
───────────────────────────
xs     4px
sm     8px
md    16px
lg    24px
xl    32px
2xl   48px
3xl   64px

Screen padding (horizontal): 20px
Card inner padding:           16px
Section gap:                  24px
Bottom tab bar height:        80px (safe area aware)
Status bar: transparent, icons adapt to theme
```

---

## 06. Border Radius & Elevation

```
Radius
───────────────────────────
radius-sm     8px    (chips, tags)
radius-md    12px    (cards, inputs)
radius-lg    16px    (sheets, modals)
radius-xl    24px    (hero cards)
radius-full  9999px  (pills, badges, FABs)

Dark mode elevation → glow shadow (colored, no gray)
Light mode elevation → subtle gray box-shadow + border
```

---

## 07. Component Library

### Cards
- **GlowCard** (dark): `bg-surface`, 1px border `bg-border`, colored glow shadow matching card topic (green=growth, blue=sleep, purple=projection)
- **CleanCard** (light): `bg-surface`, 1px border `bg-border`, subtle drop shadow `0 2px 8px rgba(0,0,0,0.07)`

### Buttons
```
Primary CTA
  Dark:  bg glow-green, text #000, border-radius full, glow shadow-green
  Light: bg accent-green, text #fff, no shadow

Secondary
  Dark:  border 1px glow-green, transparent bg, text glow-green
  Light: border 1px accent-green, transparent bg, text accent-green

Ghost
  Dark:  text text-secondary, no border
  Light: text text-secondary, no border

Destructive
  Dark:  bg glow-red with opacity 0.15, text glow-red
  Light: bg accent-red 10%, text accent-red
```

### Inputs
```
Dark:  bg bg-elevated, border bg-border, focus border glow-green + shadow-green
Light: bg bg-muted, border bg-border, focus border accent-green
Height: 52px, radius-md, Jakarta 400 16px
```

### Bottom Tab Bar
```
Dark:  bg #000000, top border bg-border, active icon + label glow-green
       inactive icon text-muted
Light: bg #FFFFFF, top border bg-border, active accent-green, inactive text-muted
Tab items: Dashboard, Chart, Routine, Sleep, Nutrition
Active tab: label visible + icon filled. Inactive: icon only.
```

### Charts (Victory Native / Skia)
```
Dark mode chart palette
  Line/area:  glow-green (#00FF87) with 20% fill gradient to transparent
  Sleep bars: glow-blue (#00BFFF)
  Projection: glow-purple dashed line
  Missed:     glow-red dot marker
  Grid lines: bg-border (#1A1A1A)
  Axis text:  text-muted, JetBrains Mono 11px

Light mode chart palette
  Line/area:  accent-green, light fill gradient
  Sleep bars: accent-blue
  Projection: accent-purple dashed
  Grid lines: #E2E6EC
  Axis text:  text-muted
```

### Progress Rings
- Circular SVG rings, stroke = glow color (dark) / accent color (light)
- Background track = bg-border
- Center: Bebas Neue display number + Jakarta caption label

### Streak Badges
- Filled: glow-green bg (10% opacity), glow-green border, glow-green icon
- Missed: bg-border, text-muted
- Size: 40px circle

---

## 08. Screen-by-Screen Specs

---

### SCREEN 1 — Splash / Onboarding Carousel
**Purpose:** First impression, value proposition in 3 slides  

**Layout (each slide):**
- Full-bleed black bg
- Center: large abstract SVG illustration (human silhouette with measurement lines, glowing green)
- Slide 1: *"Track every centimeter."* — glow-green headline
- Slide 2: *"Train. Sleep. Grow."* — tri-color word highlights (green/blue/purple)
- Slide 3: *"Your growth, visualized."* — purple glow chart illustration
- Bottom: dot pagination, Skip (ghost), Next / Get Started (primary CTA)
- Font: heading-1 (28px) for headline, body-md for sub

**Animations:** Slide-in horizontal, SVG illustration fade+scale on enter

---

### SCREEN 2 — Sign Up / Login
**Purpose:** Account creation or login  

**Layout:**
- Top: TallUp wordmark (Bebas Neue, 32px, glow-green)
- Segmented control: Sign Up | Log In
- Inputs: Name, Email, Password
- Primary CTA: "Continue →"
- Divider: "or continue with"
- Social buttons: Google, Apple (outline style)
- Bottom: terms caption

**Dark specifics:** Input focus rings glow-green. Background: subtle radial gradient from bg-surface at center fading to #000.

---

### SCREEN 3 — Profile Setup
**Purpose:** Personalize experience — multi-step  

**Steps (3-step progress bar at top):**
1. **Basic Info:** Age (number wheel), Biological Sex (segmented: Male/Female), Ethnicity (optional — for bone growth context)
2. **Measurements:** Current height (cm/ft toggle, large Bebas number input), Weight (optional)
3. **Goals:** Goal height slider, Commitment level (3/5/7 days/week chips)

**Design notes:**
- Step indicator: 3 dots, active = glow-green filled, inactive = bg-border
- Height input: Giant Bebas Neue "183 cm" editable, tap to open drum picker
- CTA bottom-fixed: "Next →" or "Finish Setup →"

---

### SCREEN 4 — Dashboard (Home Tab)
**Purpose:** Daily hub — snapshot of all pillars  

**Sections (scrollable, 20px horizontal padding):**

**A. Header Bar**
- Left: "Good morning, Naman 👋" body-md, text-secondary
- Right: Avatar circle (initials) + notification bell

**B. Hero Card — Today's Height Goal Progress**
- GlowCard (full width), glow-green shadow
- Left: Current height in Bebas Neue display-xl (e.g., "173.2 cm")
- Right: Progress ring showing % of goal reached (glow-purple)
- Below: "+0.4 cm this month" badge (glow-green chip)

**C. Daily Streak Strip**
- 7 day strip (Mon–Sun), today glowing green, streaks filled, missed red, future muted
- Below: "🔥 12-day streak" label

**D. Today's Task Cards (2-column grid)**
- **Stretch Routine** — glow-green icon, "3 of 5 done" progress bar
- **Sleep Last Night** — glow-blue icon, "7.5 hrs · Good" label
- **Nutrition Tip** — amber icon, "Calcium focus today"
- **Growth Insight** — glow-purple icon, AI tip snippet

**E. Weekly Growth Sparkline**
- Small line chart (Victory Native), 7 days, glow-green line, minimal axis
- Title: "This Week" heading-3

**F. Quick Log FAB**
- Bottom-right floating: "+" button, bg glow-green, text #000, circle 56px, shadow-green

---

### SCREEN 5 — Measurements & Growth Chart Tab
**Purpose:** Full growth history and visualization  

**Sections:**

**A. Height Header**
- "Current Height" label, Bebas Neue 56px value (dark: glow-green text)
- "+2.3 cm in 3 months" sub-badge (green chip)
- "Log Height" outlined button (top-right)

**B. Time Range Selector**
- Pill chips: 1M · 3M · 6M · 1Y · All
- Active: glow-green filled pill; inactive: bg-border

**C. Main Growth Chart**
- Line chart, full width minus 20px padding, height 220px
- glow-green line + gradient fill (green → transparent downward)
- Projection dashed line in glow-purple beyond last point
- X-axis: JetBrains Mono month labels
- Y-axis: cm values, right-aligned
- Tap on data point: tooltip card floats with date + value

**D. Stats Row (3 columns)**
- Avg monthly gain · Best month · Total gain (since start)
- Each: mono-lg value, label caption below

**E. Entry Log List**
- Recent 5 entries: date + height, glow-green dot indicator
- "View All" ghost link

---

### SCREEN 6 — Daily Routine Tab
**Purpose:** Structured stretch + exercise program  

**Sections:**

**A. Today's Routine Header**
- Title: "Day 14 · Upper Body Stretch" heading-2
- Progress: "2 / 6 Complete" with linear progress bar (glow-green)
- Est. time: "~22 min" body-md text-secondary

**B. Exercise List (vertical stack)**
Each exercise card:
- Left: exercise thumbnail (icon/illustration), color-coded (green=stretch, blue=posture, purple=spine)
- Center: Exercise name (body-lg), sets/reps or duration (mono-sm)
- Right: Completion check (circle → filled glow-green on tap)
- State: incomplete (default), in-progress (pulsing glow border), done (green check + muted bg)

**C. Rest Day Banner** (if applicable)
- Full-width glow-purple card: "Rest Day 🧘 — Light walk encouraged"

**D. Routine Streak Card**
- "7 routines this week" glow-green badge + bar visualization

**E. Start Routine CTA (bottom-fixed)**
- "Start Today's Routine →" primary button

---

### SCREEN 7 — Sleep Tracker Tab
**Purpose:** Log and analyze sleep for growth hormone optimization  

**Sections:**

**A. Sleep Score Hero**
- Large circular progress ring (glow-blue), center value: "82" (score)
- Label: "Sleep Quality" caption
- Tagline: "Good recovery" in text-secondary

**B. Last Night Summary (3-column row)**
- Bedtime: "10:48 PM" (mono-lg)
- Wake: "6:30 AM" (mono-lg)
- Duration: "7h 42m" (mono-lg, glow-blue)

**C. 7-Day Sleep Bar Chart**
- Bar chart (Victory Native), bars glow-blue
- Dashed reference line at 8h (ideal)
- Bars < 6h: glow-red tint
- X-axis: Mon–Sun labels

**D. Sleep Quality Log**
- 5-star emoji tap scale (😴😪😐😊🌟)
- Notes input (optional, ghost textarea)
- "Log Sleep" primary button

**E. Growth Hormone Insight Card**
- GlowCard, purple glow: "Deep sleep (10PM–2AM) triggers peak GH release. You're hitting this window 4/7 nights."
- Tip chip: "Try sleeping 30 min earlier"

---

### SCREEN 8 — Nutrition Hub Tab
**Purpose:** Daily micro-learnings + food guidance  

**Sections:**

**A. Today's Focus Nutrient**
- Large hero card, amber left-border accent
- Icon + nutrient name (e.g., "Calcium") heading-2
- One-liner benefit: "Supports bone density and growth plate development"
- Daily target: progress bar + "800mg / 1200mg"

**B. Nutrient Pillars (horizontal scroll chips)**
- Calcium · Vitamin D · Protein · Zinc · Magnesium · Vitamin K2
- Active: filled amber/green chip; tap to highlight section

**C. Food Cards (2-column grid)**
- Each: food illustration (emoji or icon), food name, key nutrient callout (mono-sm), "Add to log" micro-button
- Examples: Milk, Eggs, Salmon, Spinach, Almonds

**D. Hydration Tracker**
- 8-glass water row (tap each to fill, glow-blue fill state)
- "6 / 8 glasses" label

**E. Weekly Nutrition Score**
- Donut chart with 5 segments (one per nutrient pillar)
- Score: "74 / 100" Bebas Neue center

---

### SCREEN 9 — Routine Detail
**Purpose:** Full breakdown of a specific routine  

**Layout:**
- Header image banner (illustration of routine type)
- Routine name heading-1 + difficulty chip (Beginner/Intermediate)
- Duration, calorie burn, target area row (3 icons)
- Exercise list (full, with sets/reps and expand chevron)
- "Start Routine" bottom-fixed CTA

---

### SCREEN 10 — Exercise Player (Active Session)
**Purpose:** Guided step-by-step during workout  

**Layout (full-screen, minimal chrome):**
- Top: X (exit), exercise name, step indicator "3 / 6"
- Center: Large exercise animation (Lottie or Skia SVG illustration)
- Timer: Bebas Neue 64px countdown (glow-green)
- Bottom row: Skip · Rest (15s) · Done ✓
- Background: pure black, colored glow pulse synced to timer

---

### SCREEN 11 — Log Height Entry
**Purpose:** Manual height measurement entry  

**Layout (modal bottom sheet, 75% height):**
- Title: "Log Today's Height" heading-2
- Height input: drum-wheel picker (feet+inches / cm toggle)
- Date: auto today, editable
- Notes: optional text input
- Measurement tip: "Measure in the morning for accuracy"
- CTA: "Save Entry" primary

---

### SCREEN 12 — Growth Projection Screen
**Purpose:** AI-calculated future growth forecast  

**Layout:**
- Header: "Your Growth Projection" heading-1, glow-purple accent
- Chart: Dual-line (actual = glow-green, projected = glow-purple dashed), extended to age 21
- Projected final height: Bebas Neue display-xl in purple
- Height range band (confidence interval): semi-transparent purple fill between min/max projection
- Factors section: Genetics (60%) · Sleep (15%) · Nutrition (15%) · Exercise (10%) — horizontal bar breakdown
- "Improve your projection" CTA → links to routine + sleep

---

### SCREEN 13 — Sleep Log Detail
**Purpose:** Edit or view a specific past sleep entry  

**Layout:**
- Date header
- Timeline visual (bedtime → wake, horizontal bar)
- Quality rating, duration, notes
- Edit / Delete actions
- GH window highlight: green band on 10PM–2AM segment if captured

---

### SCREEN 14 — Nutrition Detail
**Purpose:** Deep-dive on a specific nutrient  

**Layout:**
- Nutrient name heading-1 + benefit paragraph
- Recommended daily amount card
- Top food sources (ranked list with amounts)
- Deficiency warning signs (collapsible)
- "Log intake" quick action

---

### SCREEN 15 — Streak & Achievements
**Purpose:** Gamification and motivation  

**Sections:**
- Current streak (giant Bebas Neue + flame icon, glow-green or glow-red)
- Badge grid: earned badges (colored + glowing), locked (muted)
- Milestones: "First 1cm gain" · "30-day streak" · "Sleep score 90+"
- History: monthly consistency heatmap (GitHub-style, green intensity)

---

### SCREEN 16 — Settings & Profile
**Purpose:** Account, preferences, app config  

**Sections:**
- Avatar + name + age + current height
- Measurement unit (cm / ft-in)
- Notification preferences (routine reminders, sleep reminder, weekly report)
- Theme toggle (Dark / Light / System)
- Height goal edit
- Account (logout, delete)

---

## 09. Motion & Interaction Principles

```
Transitions
───────────────────────────────────────────────
Screen push:       native stack slide (100ms ease)
Modal sheet:       spring up from bottom (damping 0.8)
Tab switch:        fade 150ms
Card press:        scale 0.97, shadow reduces (80ms)

Data Animations
───────────────────────────────────────────────
Chart draw-on:     line draws left-to-right (600ms ease-out) on screen mount
Progress rings:    arc animates from 0 to value (800ms spring)
Counter numbers:   animate up from 0 (400ms ease-out, Bebas Neue)
Glow pulse:        active elements pulse shadow opacity 60%→100% (2s infinite)

Micro-interactions
───────────────────────────────────────────────
Exercise check:    circle fills green + checkmark pop + haptic medium
Sleep log save:    card slides in from bottom + score ring re-animates
Height log save:   chart re-draws with new point + confetti burst (milestone)
Streak milestone:  full-screen flash animation + badge pop-in
```

---

## 10. Iconography

```
Library:       Phosphor Icons (React Native compatible)
Style:         Duotone style for tab icons; Regular for list items
Size system:   16px (inline) · 20px (list) · 24px (tab) · 32px (hero)
Dark tint:     active = glow accent, inactive = text-muted (#555)
Light tint:    active = accent color, inactive = text-secondary
```

---

## 11. Navigation Architecture

```
Root Stack
├── AuthStack (unauthenticated)
│   ├── Onboarding Carousel
│   ├── Auth Screen (login/signup)
│   └── Profile Setup
│
└── MainTabs (authenticated)
    ├── Tab: Dashboard
    ├── Tab: Chart (Measurements)
    ├── Tab: Routine
    ├── Tab: Sleep
    └── Tab: Nutrition
        │
        └── Modals (stack over tabs)
            ├── Log Height Sheet
            ├── Exercise Player (full-screen)
            ├── Sleep Log Detail
            ├── Growth Projection
            ├── Achievements
            └── Settings
```

---

## 12. Tech Stack Recommendations

```
Navigation:      Expo Router (file-based) or React Navigation v6
Charts:          Victory Native XL + React Native Skia (for glow effects)
Animations:      React Native Reanimated 3 + Moti
Styling:         NativeWind v4 (Tailwind) + StyleSheet for custom shadows
State:           Zustand (lightweight, feature-sliced)
Storage:         MMKV (height logs, sleep logs, streak data)
Fonts:           expo-google-fonts (Plus Jakarta Sans, JetBrains Mono)
                 + Bebas Neue via custom font asset
Icons:           phosphor-react-native
Haptics:         expo-haptics
Notifications:   expo-notifications
```

---

## 13. Dark / Light Mode Implementation

```javascript
// tokens.ts — example token structure
export const colors = {
  dark: {
    bgBase:      '#000000',
    bgSurface:   '#0A0A0A',
    bgElevated:  '#111111',
    bgBorder:    '#1A1A1A',
    glowGreen:   '#00FF87',
    glowBlue:    '#00BFFF',
    glowPurple:  '#B44FFF',
    glowRed:     '#FF3D5A',
    textPrimary: '#FFFFFF',
    textSecond:  '#A0A0A0',
    textMuted:   '#555555',
  },
  light: {
    bgBase:      '#F4F6F9',
    bgSurface:   '#FFFFFF',
    bgElevated:  '#FFFFFF',
    bgBorder:    '#E2E6EC',
    accentGreen: '#00A35C',
    accentBlue:  '#006FD6',
    accentPurple:'#7B2FBE',
    accentRed:   '#D92D47',
    textPrimary: '#0D1117',
    textSecond:  '#4B5563',
    textMuted:   '#9CA3AF',
  }
}

// Glow shadow helper (dark mode only)
export const glowShadow = (color: string, intensity = 0.35) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: intensity,
  shadowRadius: 20,
  elevation: 10, // Android
})
```

---

## 14. Accessibility

- All interactive targets minimum 44×44px
- Color is never the sole conveyor of state (always paired with icon/label)
- Chart data accessible via VoiceOver labels on data points
- Dynamic font size support via RN `allowFontScaling`
- Dark glow colors checked against WCAG AA on black backgrounds (all pass at full opacity)

---

*End of TallUp Design System v1.0*