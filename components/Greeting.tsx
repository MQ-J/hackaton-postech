import { useAccount } from "@/contexts/AccountContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAnimate } from "@/hooks/useAnimate";
import { useMemo } from "react";
import { Animated, StyleSheet, Text } from "react-native";

/**
 * Componente responsável por exibir uma saudação personalizada para o usuário
 * autenticado juntamente com a data atual.
 *
 * A exibição utiliza animação de entrada com opacidade e deslocamento vertical.
 *
 * @returns {JSX.Element} Componente animado contendo a saudação do usuário e a data formatada.
 */
export function Greeting() {
    const { account } = useAccount()
    const { scaleFont } = useAccessibility()
    const { opacity, translateY } = useAnimate()

    const firstName = account?.userName.split(' ')[0] ?? ''

    const styles = useMemo(
        () =>
            StyleSheet.create({
                header: {
                    marginBottom: 24,
                },
                greeting: {
                    fontSize: scaleFont(24),
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: 4,
                },
                date: {
                    fontSize: scaleFont(14),
                    color: 'rgba(255,255,255,0.7)',
                },
            }),
        [scaleFont],
    )


    return (
        <Animated.View
            style={[
                styles.header,
                { opacity, transform: [{ translateY }] },
            ]}
        >
            <Text style={styles.greeting}>Olá, {firstName}!</Text>
            <Text style={styles.date}>{getGreeting()}</Text>
        </Animated.View>
    )
}

function getGreeting(): string {
    const date = new Date()
    const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' })
    const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
    const capitalized = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    return `${capitalized}, ${formattedDate}`
}
