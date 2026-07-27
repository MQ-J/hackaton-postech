import { ColorContrastPreset, useAccessibility } from "@/contexts/AccessibilityContext";
import { useAnimate } from "@/hooks/useAnimate";
import { useTabletLayout } from "@/hooks/useTabletLayout";
import { theme } from "@/theme/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

/**
 * Componente responsável por exibir uma saudação personalizada para o usuário
 * autenticado juntamente com a data atual.
 *
 * A exibição utiliza animação de entrada com opacidade e deslocamento vertical.
 *
 * @returns {JSX.Element} Componente animado contendo a saudação do usuário e a data formatada.
 */
export function AppLogo() {
    const { scaleFont, colorContrast } = useAccessibility()
    const { opacity, translateY } = useAnimate()
    const { isTablet } = useTabletLayout()

    const styles = useMemo(() => createAppLogoStyles(scaleFont, colorContrast), [scaleFont, colorContrast])

    return (
        <Animated.View
            style={[
                styles.header,
                { opacity, transform: [{ translateY }] },
            ]}
        >
            <View
                style={styles.logoContainer}
                accessibilityRole="header"
                accessibilityLabel="Logo SeniorEase"
            >
                <Ionicons
                    name="accessibility-outline"
                    size={isTablet ? 28 : 24}
                    color={theme.defaultHome}
                />
                <Text style={[styles.logoText, isTablet && styles.logoTextTablet]}>
                    SeniorEase
                </Text>
            </View>
        </Animated.View>
    )
}

function createAppLogoStyles(scaleFont: (baseSize: number) => number, colorContrast: ColorContrastPreset) {
    return StyleSheet.create({
        header: {
            marginBottom: 24,
        },
        logoContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        logoText: {
            fontSize: 20,
            fontWeight: '700',
            color: '#fff',
        },
        logoTextTablet: {
            fontSize: 22,
        },

    })
}
