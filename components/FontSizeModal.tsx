import { PrimaryButton } from '@/components/PrimaryButton'
import {
  FONT_PRESET_LABELS,
  type FontSizePreset,
  useAccessibility,
} from '@/contexts/AccessibilityContext'
import { theme } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

const PRESETS: FontSizePreset[] = ['normal', 'large', 'extraLarge']

const PRESET_DESCRIPTIONS: Record<FontSizePreset, string> = {
  normal: 'Tamanho médio.',
  large: 'Texto mais confortável.',
  extraLarge: 'Maior tamanho de texto.',
}

interface FontSizeModalProps {
  visible: boolean
  onClose: () => void
}

export function FontSizeModal({ visible, onClose }: FontSizeModalProps) {
  const { fontPreset, setFontPreset, scaleFont } = useAccessibility()

  const handleSelect = async (preset: FontSizePreset) => {
    await setFontPreset(preset)
    Toast.show({
      type: 'success',
      text1: 'Fonte atualizada',
      text2: `Tamanho ${FONT_PRESET_LABELS[preset].toLowerCase()} aplicado.`,
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
          <Text style={[styles.title, { fontSize: scaleFont(18) }]}>
            Tamanho do texto
          </Text>
          <Text style={[styles.subtitle, { fontSize: scaleFont(14) }]}>
            Escolha o tamanho que ficar mais confortável para você.
          </Text>

          <View style={styles.options}>
            {PRESETS.map((preset) => {
              const selected = fontPreset === preset

              const fontSize =
                preset === 'normal' ? 14 : preset === 'large' ? 18 : 22

              return (
                <Pressable
                  key={preset}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => void handleSelect(preset)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${FONT_PRESET_LABELS[preset]}${selected ? ', selecionado' : ''}`}
                >
                  <View style={styles.optionHeader}>
                    <Text
                      style={[
                        styles.optionLabel,
                        { fontSize },
                        selected && styles.optionLabelSelected,
                      ]}
                    >
                      {FONT_PRESET_LABELS[preset]}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={22} color={theme.defaultHome} />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.optionDescription,
                      { fontSize },
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
