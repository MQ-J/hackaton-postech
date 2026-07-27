import { PrimaryButton } from '@/components/PrimaryButton'
import {
    INTERFACE_MODE_LABELS,
    type InterfaceModePreset,
    useAccessibility,
} from '@/contexts/AccessibilityContext'
import { theme } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

const PRESETS: InterfaceModePreset[] = ['basic', 'advanced']

const PRESET_DESCRIPTIONS: Record<InterfaceModePreset, string> = {
    basic: 'Modo mais simples e mais fácil de usar.',
    advanced: 'Mais recursos e funcionalidades.',
}

interface InterfaceModeModalProps {
    visible: boolean
    onClose: () => void
}

export function InterfaceModeModal({ visible, onClose }: InterfaceModeModalProps) {
    const { interfaceMode, setInterfaceMode, scaleFont } = useAccessibility()

    const handleSelect = async (preset: InterfaceModePreset) => {
        await setInterfaceMode(preset)
        Toast.show({
            type: 'success',
            text1: 'Modo atualizado',
            text2: `Modo ${INTERFACE_MODE_LABELS[preset].toLowerCase()} aplicado.`,
        })
        onClose()
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.card}>
                    <Text style={[styles.title, { fontSize: scaleFont(18) }]}>Modo do aplicativo</Text>
                    <Text style={[styles.subtitle, { fontSize: scaleFont(14) }]}>Escolha o seu estilo.</Text>

                    <View style={styles.options}>
                        {PRESETS.map((preset) => {
                            const selected = interfaceMode === preset
                            return (
                                <Pressable
                                    key={preset}
                                    style={[styles.option, selected && styles.optionSelected]}
                                    onPress={() => void handleSelect(preset)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    accessibilityLabel={`${INTERFACE_MODE_LABELS[preset]}${selected ? ', selecionado' : ''}`}
                                >
                                    <View style={styles.optionHeader}>
                                        <Text
                                            style={[
                                                styles.optionLabel,
                                                { fontSize: scaleFont(16) },
                                                selected && styles.optionLabelSelected,
                                            ]}
                                        >
                                            {INTERFACE_MODE_LABELS[preset]}
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
})
