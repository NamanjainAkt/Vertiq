import { useState, useEffect } from 'react'
import { View, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { dark, glowShadow } from '@/lib/theme'
import { Fonts } from '@/lib/typography'
import { useLogHeight } from '@/hooks/useHeightLogs'

const CM_RANGE = Array.from({ length: 121 }, (_, i) => i + 120)
const FEET_RANGE = Array.from({ length: 6 }, (_, i) => i + 3)
const INCHES_RANGE = Array.from({ length: 12 }, (_, i) => i)

function cmToFeet(cm: number) {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches: inches === 12 ? 11 : inches }
}

function feetToCm(feet: number, inches: number) {
  return Math.round(feet * 30.48 + inches * 2.54)
}

function todayString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function LogHeightScreen() {
  const insets = useSafeAreaInsets()
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm')
  const [selectedCm, setSelectedCm] = useState(170)
  const [date, setDate] = useState(todayString())
  const [notes, setNotes] = useState('')

  const logHeight = useLogHeight()

  useEffect(() => {
    if (logHeight.isSuccess) {
      router.back()
    }
  }, [logHeight.isSuccess])

  const { feet, inches } = cmToFeet(selectedCm)
  const currentFeet = feet >= 3 && feet <= 8 ? feet : 5
  const currentInches = inches >= 0 && inches <= 11 ? inches : 0

  function handleSave() {
    logHeight.mutate({
      height_cm: selectedCm,
      logged_date: date,
      notes: notes || undefined,
    })
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.handleWrap}>
        <View style={s.handle} />
      </View>

      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={dark.textSecond} />
        </Pressable>
        <Text style={s.title}>Log Today's Height</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollBody, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.pickerSection}>
          <View style={s.unitToggle}>
            <Pressable
              style={[s.unitBtn, unit === 'cm' && s.unitBtnActive]}
              onPress={() => setUnit('cm')}
            >
              <Text style={[s.unitBtnText, unit === 'cm' && s.unitBtnTextActive]}>cm</Text>
            </Pressable>
            <Pressable
              style={[s.unitBtn, unit === 'ft' && s.unitBtnActive]}
              onPress={() => setUnit('ft')}
            >
              <Text style={[s.unitBtnText, unit === 'ft' && s.unitBtnTextActive]}>ft / in</Text>
            </Pressable>
          </View>

          {unit === 'cm' ? (
            <View style={s.pickerContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.pickerRow}
              >
                {CM_RANGE.map((cm) => (
                  <Pressable
                    key={cm}
                    style={[s.pickerItem, cm === selectedCm && s.pickerItemActive]}
                    onPress={() => setSelectedCm(cm)}
                  >
                    <Text style={[s.pickerItemText, cm === selectedCm && s.pickerItemTextActive]}>
                      {cm}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={s.ftPickerRow}>
              <View style={s.ftPickerCol}>
                <Text style={s.ftPickerLabel}>Feet</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerRow}>
                  {FEET_RANGE.map((f) => (
                    <Pressable
                      key={f}
                      style={[s.pickerItem, f === currentFeet && s.pickerItemActive]}
                      onPress={() => setSelectedCm(feetToCm(f, currentInches))}
                    >
                      <Text style={[s.pickerItemText, f === currentFeet && s.pickerItemTextActive]}>{f}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <View style={s.ftPickerCol}>
                <Text style={s.ftPickerLabel}>Inches</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerRow}>
                  {INCHES_RANGE.map((i) => (
                    <Pressable
                      key={i}
                      style={[s.pickerItem, i === currentInches && s.pickerItemActive]}
                      onPress={() => setSelectedCm(feetToCm(currentFeet, i))}
                    >
                      <Text style={[s.pickerItemText, i === currentInches && s.pickerItemTextActive]}>{i}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </View>

        <View style={s.displayRow}>
          <Text style={s.displayValue}>
            {unit === 'cm' ? `${selectedCm} cm` : `${currentFeet}'${currentInches}"`}
          </Text>
        </View>

        <View style={s.fieldCard}>
          <Text style={s.fieldLabel}>Date</Text>
          <TextInput
            style={s.textInput}
            value={date}
            onChangeText={setDate}
            placeholderTextColor={dark.textMuted}
          />
        </View>

        <View style={s.fieldCard}>
          <Text style={s.fieldLabel}>Notes</Text>
          <TextInput
            style={[s.textInput, s.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note..."
            placeholderTextColor={dark.textMuted}
            multiline
          />
        </View>

        <View style={s.tipCard}>
          <Ionicons name="bulb-outline" size={16} color={dark.glowGreen} />
          <Text style={s.tipText}>Measure in the morning for accuracy</Text>
        </View>

        <Pressable
          style={[s.saveBtn, logHeight.isPending && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={logHeight.isPending}
        >
          {logHeight.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={s.saveBtnText}>Save Entry</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: dark.bgBase,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: dark.bgBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 22,
    lineHeight: 28,
    color: dark.textPrimary,
  },
  scrollBody: {
    padding: 20,
    gap: 20,
  },
  pickerSection: {
    backgroundColor: dark.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: dark.bgBorder,
    padding: 16,
    gap: 16,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: dark.bgBase,
    borderRadius: 10,
    padding: 3,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  unitBtnActive: {
    backgroundColor: dark.glowGreen,
  },
  unitBtnText: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    color: dark.textMuted,
  },
  unitBtnTextActive: {
    color: '#000',
  },
  pickerContainer: {},
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  pickerItem: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: dark.bgElevated,
    borderWidth: 1,
    borderColor: dark.bgBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemActive: {
    backgroundColor: dark.glowGreen,
    borderColor: dark.glowGreen,
  },
  pickerItemText: {
    fontFamily: Fonts.mono,
    fontSize: 18,
    color: dark.textSecond,
  },
  pickerItemTextActive: {
    color: '#000',
    fontFamily: Fonts.monoBold,
  },
  ftPickerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  ftPickerCol: {
    flex: 1,
    gap: 8,
  },
  ftPickerLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: dark.textSecond,
  },
  displayRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  displayValue: {
    fontFamily: Fonts.display,
    fontSize: 48,
    lineHeight: 54,
    color: dark.glowGreen,
  },
  fieldCard: {
    backgroundColor: dark.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: dark.bgBorder,
    padding: 16,
    gap: 8,
  },
  fieldLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: dark.textSecond,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  textInput: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: dark.textPrimary,
    padding: 0,
  },
  notesInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,255,135,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.2)',
    padding: 14,
  },
  tipText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: dark.textSecond,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: dark.glowGreen,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    ...glowShadow(dark.glowGreen, 0.5),
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#000',
  },
})