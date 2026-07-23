import { TABLET_BREAKPOINT } from "@/constants/layout"
import { useWindowDimensions } from "react-native"

/**
 * Hook para identificar se o layout atual deve ser tratado como tablet
 * com base na largura disponível da janela.
 *
 * A validação utiliza o valor definido em `TABLET_BREAKPOINT`
 * como limite mínimo para considerar o dispositivo como tablet.
 *
 * @returns {{ isTablet: boolean }} Objeto contendo a indicação se o layout atual é de tablet.
 */
export function useTabletLayout() {
    const { width } = useWindowDimensions()

    const isTablet = width >= TABLET_BREAKPOINT

    return {
        isTablet
    }
}