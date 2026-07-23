import { BalanceCard } from '@/components/BalanceCard'
import { ChartsNative } from '@/components/charts/ChartsNative'
import { Greeting } from '@/components/Greeting'
import { PrimaryButton } from '@/components/PrimaryButton'
import { RecentTransactions } from '@/components/RecentTransactions'
import { TransactionForm } from '@/components/TransactionForm'
import { MAX_CONTENT_WIDTH } from '@/constants/layout'
import { useAccount } from '@/contexts/AccountContext'
import { useAnimate } from '@/hooks/useAnimate'
import { useDeferredMount } from '@/hooks/useDeferredMount'
import { useTabletLayout } from '@/hooks/useTabletLayout'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'


export default function HomeScreen() {
  const { account, logout, isHydrated } = useAccount()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const contentWidth = Math.min(width - 32, MAX_CONTENT_WIDTH)
  const centered = width > MAX_CONTENT_WIDTH
  const { isTablet } = useTabletLayout()

  const { opacity: balanceOpacity, translateY: balanceTranslateY } = useAnimate()
  const { opacity: transactionsOpacity, translateY: transactionsTranslateY } = useAnimate()
  const { opacity: chartsOpacity, translateY: chartsTranslateY } = useAnimate()
  const chartsReady = useDeferredMount()

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

  if (!account) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <Text style={styles.emptyTitle}>Nenhuma conta carregada</Text>
        <Text style={styles.emptySubtitle}>
          Volte para a tela de login para acessar sua conta.
        </Text>
        <PrimaryButton
          label="Ir para o login"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.emptyButton}
          iconName="log-in-outline"
        />
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

          <Animated.View
            style={[
              styles.section,
              { opacity: balanceOpacity, transform: [{ translateY: balanceTranslateY }] },
            ]}
          >
            <BalanceCard balance={account.balance} />
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              { opacity: transactionsOpacity, transform: [{ translateY: transactionsTranslateY }] },
            ]}
          >
            <Text style={styles.cardTitle}>Nova transação</Text>
            <TransactionForm />
          </Animated.View>

          <Animated.View
            style={[
              styles.section,
              { opacity: transactionsOpacity, transform: [{ translateY: transactionsTranslateY }] },
            ]}
          >
            <RecentTransactions />
          </Animated.View>

          <Animated.View
            style={{
              opacity: chartsOpacity,
              transform: [{ translateY: chartsTranslateY }],
            }}
          >
            {chartsReady ? (
              isTablet ? (
                <View style={[styles.chartsRow, styles.chartsRowTablet]}>
                  <View style={[styles.chartItem, styles.chartItemTablet]}>
                    <ChartsNative type="Bar" transactions={account.transactions} />
                  </View>
                  <View style={[styles.chartItem, styles.chartItemTablet]}>
                    <ChartsNative type="Pie" transactions={account.transactions} />
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.chartItem}>
                    <ChartsNative type="Bar" transactions={account.transactions} />
                  </View>
                  <View style={styles.chartItem}>
                    <ChartsNative type="Pie" transactions={account.transactions} />
                  </View>
                </>
              )
            ) : (
              <View style={styles.chartsPlaceholder}>
                <ActivityIndicator size="large" color="#ffd33d" />
              </View>
            )}
          </Animated.View>

          <PrimaryButton
            label="Sair"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
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
  chartsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  chartItem: {
    marginBottom: 16,
  },
  chartsRowTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartItemTablet: {
    flex: 1,
    marginBottom: 0,
    marginRight: 16,
  },
  chartsPlaceholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
})
