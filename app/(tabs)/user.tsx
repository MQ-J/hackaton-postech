import { Greeting } from '@/components/Greeting'
import { PrimaryButton } from '@/components/PrimaryButton'
import { MAX_CONTENT_WIDTH } from '@/constants/layout'
import { useAccount } from '@/contexts/AccountContext'
import { useTabletLayout } from '@/hooks/useTabletLayout'
import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'


export default function UserScreen() {
  const { logout, isHydrated } = useAccount()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const contentWidth = Math.min(width - 32, MAX_CONTENT_WIDTH)
  const centered = width > MAX_CONTENT_WIDTH
  const { isTablet } = useTabletLayout()


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
            label="Modo da interface"
            variant="outline"
            onPress={handleLogout}
            style={styles.userOptionsButton}
            iconName="log-out-outline"
          />

          <PrimaryButton
            label="Tamanho da fonte"
            variant="outline"
            onPress={handleLogout}
            style={styles.userOptionsButton}
            iconName="log-out-outline"
          />

          <PrimaryButton
            label="Contraste"
            variant="outline"
            onPress={handleLogout}
            style={styles.userOptionsButton}
            iconName="log-out-outline"
          />

          <PrimaryButton
            label="Espaçamento"
            variant="outline"
            onPress={handleLogout}
            style={styles.userOptionsButton}
            iconName="log-out-outline"
          />

          <PrimaryButton
            label="Feedback reforçado"
            variant="outline"
            onPress={handleLogout}
            style={styles.userOptionsButton}
            iconName="log-out-outline"
          />


          <PrimaryButton
            label="Exigir confirmação"
            variant="outline"
            onPress={handleLogout}
            style={styles.userOptionsButton}
            iconName="log-out-outline"
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 4,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  content: {
    maxWidth: MAX_CONTENT_WIDTH,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  chartItem: {
    marginBottom: 16,
  },
  chartItemTablet: {
    flex: 1,
    marginBottom: 0,
    marginRight: 16,
  },
  userOptionsButton: {
    marginTop: 16,
  },
})
