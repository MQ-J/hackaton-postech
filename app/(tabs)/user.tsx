import { FontSizeModal } from '@/components/FontSizeModal'
import { Greeting } from '@/components/Greeting'
import { PrimaryButton } from '@/components/PrimaryButton'
import { MAX_CONTENT_WIDTH } from '@/constants/layout'
import {
  FONT_PRESET_LABELS,
  useAccessibility,
} from '@/contexts/AccessibilityContext'
import { useAccount } from '@/contexts/AccountContext'
import { useTabletLayout } from '@/hooks/useTabletLayout'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function UserScreen() {
  const { logout, isHydrated } = useAccount()
  const { fontPreset } = useAccessibility()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const contentWidth = Math.min(width - 32, MAX_CONTENT_WIDTH)
  const centered = width > MAX_CONTENT_WIDTH
  const { isTablet } = useTabletLayout()
  const [fontModalVisible, setFontModalVisible] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

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
          <Greeting />

          <PrimaryButton
            label="Modo da interface (em breve)"
            variant="outline"
            disabled
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
            label="Contraste (em breve)"
            variant="outline"
            disabled
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

          <PrimaryButton
            label="Sair"
            variant="outline"
            onPress={handleLogout}
            style={styles.userOptionsButton}
            iconName="log-out-outline"
          />
        </View>
      </ScrollView>

      <FontSizeModal
        visible={fontModalVisible}
        onClose={() => setFontModalVisible(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
  },
})
