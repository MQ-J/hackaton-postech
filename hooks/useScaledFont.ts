import { useAccessibility } from '@/contexts/AccessibilityContext'

export function useScaledFont(base: number): number {
  const { scaleFont } = useAccessibility()
  return scaleFont(base)
}
