import { AppLogo } from '@/components/AppLogo'
import { ColorContrastModal } from '@/components/ColorContrastModal'
import { FontSizeModal } from '@/components/FontSizeModal'
import { InterfaceModeModal } from '@/components/InterfaceModeModal'
import { PrimaryButton } from '@/components/PrimaryButton'
import { MAX_CONTENT_WIDTH } from '@/constants/layout'
import {
  COLOR_CONTRAST_LABELS,
  ColorContrastPreset,
  FONT_PRESET_LABELS,
  INTERFACE_MODE_LABELS,
  useAccessibility,
} from '@/contexts/AccessibilityContext'
import { useAccount } from '@/contexts/AccountContext'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function UserScreen() {
  const { isHydrated } = useAccount()
  const { scaleFont, fontPreset, colorContrast, interfaceMode } = useAccessibility()
  const { width } = useWindowDimensions()
  const contentWidth = Math.min(width - 32, MAX_CONTENT_WIDTH)
  const centered = width > MAX_CONTENT_WIDTH
  const [interfaceModeModalVisible, setInterfaceModeModalVisible] = useState(false)
  const [fontModalVisible, setFontModalVisible] = useState(false)
  const [colorContrastModalVisible, setColorContrastModalVisible] = useState(false)

  const styles = useMemo(() => createUserScreenStyles(scaleFont, colorContrast), [scaleFont, colorContrast])

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeRoot} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          centered && { alignItems: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <AppLogo />

          <PrimaryButton
            label={`Modo da interface · ${INTERFACE_MODE_LABELS[interfaceMode]}`}
            variant="outline"
            onPress={() => setInterfaceModeModalVisible(true)}
            style={styles.userOptionsButton}
            iconName="layers-outline"
          />

          <PrimaryButton
            label={`Tamanho da fonte · ${FONT_PRESET_LABELS[fontPreset]}`}
            variant="outline"
            onPress={() => setFontModalVisible(true)}
            style={styles.userOptionsButton}
            iconName="text-outline"
          />

          <PrimaryButton
            label={`Contraste · ${COLOR_CONTRAST_LABELS[colorContrast]}`}
            variant="outline"
            onPress={() => setColorContrastModalVisible(true)}
            style={styles.userOptionsButton}
            iconName="contrast-outline"
          />

          <PrimaryButton
            label="Espaçamento (em breve)"
            variant="outline"
            disabled
            style={styles.userOptionsButton}
            iconName="expand-outline"
          />

          <PrimaryButton
            label="Feedback reforçado (em breve)"
            variant="outline"
            disabled
            style={styles.userOptionsButton}
            iconName="notifications-outline"
          />

          <PrimaryButton
            label="Exigir confirmação (em breve)"
            variant="outline"
            disabled
            style={styles.userOptionsButton}
            iconName="shield-checkmark-outline"
          />

        </View>
      </ScrollView>

      <InterfaceModeModal
        visible={interfaceModeModalVisible}
        onClose={() => setInterfaceModeModalVisible(false)}
      />

      <FontSizeModal
        visible={fontModalVisible}
        onClose={() => setFontModalVisible(false)}
      />

      <ColorContrastModal
        visible={colorContrastModalVisible}
        onClose={() => setColorContrastModalVisible(false)}
      />
    </SafeAreaView>
  )
}

function createUserScreenStyles(scaleFont: (baseSize: number) => number, colorContrast: ColorContrastPreset) {
  return StyleSheet.create({
    safeRoot: {
      flex: 1,
      backgroundColor: '#25292e',
    },
    scroll: {
      flex: 1,
      backgroundColor: '#25292e',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#25292e',
      paddingHorizontal: 24,
    },
    scrollContent: {
      paddingVertical: 24,
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    content: {
      maxWidth: MAX_CONTENT_WIDTH,
    },
    userOptionsButton: {
      marginTop: 16,
      backgroundColor: colorContrast === 'normal' ? undefined : '#0B0B0E',
    },
  })
}
