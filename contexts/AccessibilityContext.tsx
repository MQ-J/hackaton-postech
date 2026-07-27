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
export type InterfaceModePreset = 'basic' | 'advanced'

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

export const INTERFACE_MODE_LABELS: Record<InterfaceModePreset, string> = {
  basic: 'Básico',
  advanced: 'Avançado',
}

type AccessibilityPreferences = {
  fontPreset: FontSizePreset
  colorContrast: ColorContrastPreset
  interfaceMode: InterfaceModePreset
}

type AccessibilityContextValue = {
  fontPreset: FontSizePreset
  colorContrast: ColorContrastPreset
  interfaceMode: InterfaceModePreset
  fontScale: number
  setFontPreset: (preset: FontSizePreset) => Promise<void>
  setColorContrast: (preset: ColorContrastPreset) => Promise<void>
  setInterfaceMode: (preset: InterfaceModePreset) => Promise<void>
  scaleFont: (baseSize: number) => number
  isHydrated: boolean
}

const defaultPreferences: AccessibilityPreferences = {
  fontPreset: 'normal',
  colorContrast: 'normal',
  interfaceMode: 'basic',
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

function isInterfaceModePreset(value: unknown): value is InterfaceModePreset {
  return value === 'default' || value === 'compact' || value === 'spacious'
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
    const interfaceMode = isInterfaceModePreset(parsed.interfaceMode)
      ? parsed.interfaceMode
      : defaultPreferences.interfaceMode

    return { fontPreset, colorContrast, interfaceMode }
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
  const [interfaceMode, setInterfaceModeState] = useState<InterfaceModePreset>('basic')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadPreferences().then((prefs) => {
      if (cancelled) return
      setFontPresetState(prefs.fontPreset)
      setColorContrastState(prefs.colorContrast)
      setInterfaceModeState(prefs.interfaceMode)
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
    await savePreferences({ fontPreset: preset, colorContrast, interfaceMode })
  }, [colorContrast, interfaceMode])

  const setColorContrast = useCallback(async (preset: ColorContrastPreset) => {
    setColorContrastState(preset)
    await savePreferences({ fontPreset, colorContrast: preset, interfaceMode })
  }, [fontPreset, interfaceMode])

  const setInterfaceMode = useCallback(async (preset: InterfaceModePreset) => {
    setInterfaceModeState(preset)
    await savePreferences({ fontPreset, colorContrast, interfaceMode: preset })
  }, [fontPreset, colorContrast])

  const value = useMemo(
    () => ({
      fontPreset,
      colorContrast,
      interfaceMode,
      fontScale,
      setFontPreset,
      setColorContrast,
      setInterfaceMode,
      scaleFont,
      isHydrated,
    }),
    [fontPreset, colorContrast, interfaceMode, fontScale, setFontPreset, setColorContrast, setInterfaceMode, scaleFont, isHydrated],
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
