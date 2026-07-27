import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type FontSizePreset = 'normal' | 'large' | 'extraLarge'
export type ColorContrastPreset = 'normal' | 'high'

const STORAGE_KEY = 'seniorease_accessibility'

export const FONT_SCALE: Record<FontSizePreset, number> = {
  normal: 1,
  large: 1.25,
  extraLarge: 1.5,
}

export const FONT_PRESET_LABELS: Record<FontSizePreset, string> = {
  normal: 'Normal',
  large: 'Grande',
  extraLarge: 'Extra grande',
}

export const COLOR_CONTRAST_LABELS: Record<ColorContrastPreset, string> = {
  normal: 'Padrão',
  high: 'Alto contraste',
}

type AccessibilityPreferences = {
  fontPreset: FontSizePreset
  colorContrast: ColorContrastPreset
}

type AccessibilityContextValue = {
  fontPreset: FontSizePreset
  colorContrast: ColorContrastPreset
  fontScale: number
  setFontPreset: (preset: FontSizePreset) => Promise<void>
  setColorContrast: (preset: ColorContrastPreset) => Promise<void>
  scaleFont: (baseSize: number) => number
  isHydrated: boolean
}

const defaultPreferences: AccessibilityPreferences = {
  fontPreset: 'normal',
  colorContrast: 'normal',
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(
  undefined,
)

function isFontSizePreset(value: unknown): value is FontSizePreset {
  return value === 'normal' || value === 'large' || value === 'extraLarge'
}

function isColorContrastPreset(value: unknown): value is ColorContrastPreset {
  return value === 'normal' || value === 'high'
}

async function loadPreferences(): Promise<AccessibilityPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPreferences

    const parsed = JSON.parse(raw) as Partial<AccessibilityPreferences>
    const fontPreset = isFontSizePreset(parsed.fontPreset)
      ? parsed.fontPreset
      : defaultPreferences.fontPreset
    const colorContrast = isColorContrastPreset(parsed.colorContrast)
      ? parsed.colorContrast
      : defaultPreferences.colorContrast

    return { fontPreset, colorContrast }
  } catch {
    /* usa padrão */
  }
  return defaultPreferences
}

async function savePreferences(prefs: AccessibilityPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontPreset, setFontPresetState] = useState<FontSizePreset>('normal')
  const [colorContrast, setColorContrastState] = useState<ColorContrastPreset>('normal')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadPreferences().then((prefs) => {
      if (cancelled) return
      setFontPresetState(prefs.fontPreset)
      setColorContrastState(prefs.colorContrast)
      setIsHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const fontScale = FONT_SCALE[fontPreset]

  const scaleFont = useCallback(
    (baseSize: number) => Math.round(baseSize * fontScale),
    [fontScale],
  )

  const setFontPreset = useCallback(async (preset: FontSizePreset) => {
    setFontPresetState(preset)
    await savePreferences({ fontPreset: preset, colorContrast })
  }, [colorContrast])

  const setColorContrast = useCallback(async (preset: ColorContrastPreset) => {
    setColorContrastState(preset)
    await savePreferences({ fontPreset, colorContrast: preset })
  }, [fontPreset])

  const value = useMemo(
    () => ({
      fontPreset,
      colorContrast,
      fontScale,
      setFontPreset,
      setColorContrast,
      scaleFont,
      isHydrated,
    }),
    [fontPreset, colorContrast, fontScale, setFontPreset, setColorContrast, scaleFont, isHydrated],
  )

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return ctx
}
