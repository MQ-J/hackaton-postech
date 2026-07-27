import { PrimaryButton } from '@/components/PrimaryButton'
import {
    COLOR_CONTRAST_LABELS,
    type ColorContrastPreset,
    useAccessibility,
} from '@/contexts/AccessibilityContext'
import { theme } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

const PRESETS: ColorContrastPreset[] = ['normal', 'high']

const PRESET_DESCRIPTIONS: Record<ColorContrastPreset, string> = {
    normal: 'Contraste padrão do app.',
    high: 'Maior contraste.',
}

interface ColorContrastModalProps {
    visible: boolean
    onClose: () => void
}

export function ColorContrastModal({ visible, onClose }: ColorContrastModalProps) {
    const { colorContrast, setColorContrast, scaleFont } = useAccessibility()

    const handleSelect = async (preset: ColorContrastPreset) => {
        await setColorContrast(preset)
        Toast.show({
            type: 'success',
            text1: 'Contraste atualizado',
            text2: `Modo ${COLOR_CONTRAST_LABELS[preset].toLowerCase()} aplicado.`,
        })
        onClose()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.card}>
                    <Text style={[styles.title, { fontSize: scaleFont(18) }]}>Contraste</Text>
                    <Text style={[styles.subtitle, { fontSize: scaleFont(14) }]}>
                        Escolha um contraste que fique mais claro para você.
                    </Text>

                    <View style={styles.options}>
                        {PRESETS.map((preset) => {
                            const selected = colorContrast === preset
                            return (
                                <Pressable
                                    key={preset}
                                    style={[styles.option, selected && styles.optionSelected]}
                                    onPress={() => void handleSelect(preset)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    accessibilityLabel={`${COLOR_CONTRAST_LABELS[preset]}${selected ? ', selecionado' : ''}`}
                                >
                                    <View style={styles.optionHeader}>
                                        <Text
                                            style={[
                                                styles.optionLabel,
                                                { fontSize: scaleFont(16) },
                                                selected && styles.optionLabelSelected,
                                            ]}
                                        >
                                            {COLOR_CONTRAST_LABELS[preset]}
                                        </Text>
                                        {selected ? (
                                            <Ionicons name="checkmark-circle" size={22} color={theme.defaultHome} />
                                        ) : null}
                                    </View>
                                    <Text
                                        style={[
                                            styles.optionDescription,
                                            { fontSize: scaleFont(13) },
                                            selected && styles.optionDescriptionSelected,
                                        ]}
                                    >
                                        {PRESET_DESCRIPTIONS[preset]}
                                    </Text>
                                    <View
                                        style={[
                                            styles.sampleBox,
                                            preset === 'high' && styles.sampleBoxHigh,
                                        ]}
                                    >
                                        <Text style={styles.sampleText}>Exemplo de texto</Text>
                                    </View>
                                </Pressable>
                            )
                        })}
                    </View>

                    <PrimaryButton label="Fechar" variant="outline" onPress={onClose} />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        gap: 12,
    },
    title: {
        fontWeight: '700',
        color: '#111',
    },
    subtitle: {
        color: '#555',
        lineHeight: 20,
        marginBottom: 4,
    },
    options: {
        gap: 10,
        marginBottom: 4,
    },
    option: {
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 14,
        backgroundColor: '#fafafa',
    },
    optionSelected: {
        borderColor: theme.defaultHome,
        backgroundColor: '#fffbeb',
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    optionLabel: {
        fontWeight: '600',
        color: '#222',
    },
    optionLabelSelected: {
        color: '#111',
    },
    optionDescription: {
        color: '#666',
        marginBottom: 8,
    },
    optionDescriptionSelected: {
        color: '#444',
    },
    sampleBox: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#1e2329',
        alignItems: 'flex-start',
    },
    sampleBoxHigh: {
        backgroundColor: '#0B0B0E',
    },
    sampleText: {
        color: '#fff',
        fontWeight: '600',
    },
})
