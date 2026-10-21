import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LedgerProvider } from '@/context/LedgerContext';
import { AuthGate } from '@/components/AuthGate';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const BachatTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#06090F',
    card: '#0B0F19',
    text: '#F8FAFC',
    border: '#1E293B',
    primary: '#10B981',
  },
};

function RootNavigation() {
  const { isLocked, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#06090F', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // If locked or no active session, present the Security Gatekeeper Login
  if (isLocked || !user) {
    return <AuthGate />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <LedgerProvider>
        <ThemeProvider value={BachatTheme}>
          <StatusBar style="light" />
          <RootNavigation />
        </ThemeProvider>
      </LedgerProvider>
    </AuthProvider>
  );
}
