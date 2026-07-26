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

type AccessibilityPreferences = {
  fontPreset: FontSizePreset
}

type AccessibilityContextValue = {
  fontPreset: FontSizePreset
  fontScale: number
  setFontPreset: (preset: FontSizePreset) => Promise<void>
  scaleFont: (baseSize: number) => number
  isHydrated: boolean
}

const defaultPreferences: AccessibilityPreferences = {
  fontPreset: 'normal',
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(
  undefined,
)

function isFontSizePreset(value: unknown): value is FontSizePreset {
  return value === 'normal' || value === 'large' || value === 'extraLarge'
}

async function loadPreferences(): Promise<AccessibilityPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPreferences

    const parsed = JSON.parse(raw) as Partial<AccessibilityPreferences>
    if (isFontSizePreset(parsed.fontPreset)) {
      return { fontPreset: parsed.fontPreset }
    }
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
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadPreferences().then((prefs) => {
      if (cancelled) return
      setFontPresetState(prefs.fontPreset)
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
    await savePreferences({ fontPreset: preset })
  }, [])

  const value = useMemo(
    () => ({
      fontPreset,
      fontScale,
      setFontPreset,
      scaleFont,
      isHydrated,
    }),
    [fontPreset, fontScale, setFontPreset, scaleFont, isHydrated],
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
