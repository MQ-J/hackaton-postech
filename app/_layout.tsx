import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { AccountProvider } from '@/contexts/AccountContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <AccountProvider>
            <Stack initialRouteName="index">
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <Toast />
            <StatusBar style="light" />
          </AccountProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  )
}
