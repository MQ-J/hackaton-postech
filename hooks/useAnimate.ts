import { useAccount } from "@/contexts/AccountContext"
import { useIsFocused } from "@react-navigation/native"
import { useEffect, useRef } from "react"
import { Animated } from "react-native"

/**
 * Hook para controlar animações de entrada utilizando valores animados
 * de opacidade e deslocamento vertical.
 *
 * A animação é executada somente quando a conta estiver carregada,
 * disponível e a tela estiver em foco. Caso essas condições não sejam atendidas,
 * qualquer animação em andamento será interrompida.
 *
 * @returns {{ opacity: Animated.Value, translateY: Animated.Value }} Valores animados utilizados para controlar opacidade e deslocamento vertical dos componentes.
 */
export function useAnimate() {
    const { account, isHydrated } = useAccount()
    const isFocused = useIsFocused()

    const enterAnimation = useRef<Animated.CompositeAnimation | null>(null)

    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(16)).current

    useEffect(() => {
        if (!isHydrated || !account || !isFocused) {
            enterAnimation.current?.stop()
            return
        }

        enterAnimation.current?.stop()

        opacity.setValue(0)
        translateY.setValue(16)

        const anim = Animated.stagger(100, [
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 280,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 280,
                    useNativeDriver: true,
                }),
            ]),
        ])

        enterAnimation.current = anim
        anim.start()

        return () => {
            anim.stop()
        }
    }, [
        account,
        isHydrated,
        isFocused,
        opacity,
        translateY,
    ])

    return {
        opacity,
        translateY
    }
}