import { useAccessibility } from "@/contexts/AccessibilityContext";
import { StatusBar } from "expo-status-bar";

export function DinamicStatusBar() {
    const { colorContrast } = useAccessibility()

    return (
        <StatusBar style="light" backgroundColor={colorContrast === 'normal' ? '#25292e' : '#0B0B0E'} />
    )
}