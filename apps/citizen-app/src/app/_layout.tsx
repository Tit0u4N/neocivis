import { osName } from 'expo-device';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import type { ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/theme/colors';
import { ThemeProvider } from '@/theme/theme-provider';
import { AuthProvider, useAuth } from '@/services/AuthContext';
import 'react-native-reanimated';

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;

type ErrorUtilsShape = {
  getGlobalHandler?: () => GlobalErrorHandler | undefined;
  setGlobalHandler?: (handler: GlobalErrorHandler) => void;
};

SplashScreen.setOptions({
  duration: 200,
  fade: true,
});


function GlobalErrorFallback({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 8,
      }}
    >
      <Text variant="heading">{title}</Text>
      <Text style={{ textAlign: 'center' }}>{message}</Text>
    </View>
  );
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <GlobalErrorFallback
      title="Une erreur est survenue"
      message={error?.message ?? 'Erreur inconnue.'}
    />
  );
}

function InitialLayout() {

  const colorScheme = useColorScheme() || 'light';
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    if (isLoading) return;

    // `segments[0]` helps us determine the current "root" route. 
    const inTabsGroup = segments[0] === '(tabs)';
    const isLoginPage = segments[0] === 'login';
    const navigationTimeout = setTimeout(() => {
    if (!isAuthenticated && !isLoginPage) {
      // Si non connecté et qu'on n'est pas sur la page login -> On force le login
      router.replace('/login');
    } else if (isAuthenticated && isLoginPage) {
      // Si déjà connecté et qu'on est sur la page login -> On redirige vers l'appli
      router.replace('/(tabs)/(home)');
    }}, 0);

    return () => clearTimeout(navigationTimeout);
  }, [isAuthenticated, isLoading, segments]);

  return (

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen name="login/index" options={{ headerShown: false }} />

            {/* <Stack.Screen
              name="sheet"
              options={{
                headerShown: false,
                sheetGrabberVisible: true,
                sheetAllowedDetents: [0.4, 0.7, 1],
                contentStyle: {
                  backgroundColor: isLiquidGlassAvailable()
                    ? 'transparent'
                    : colorScheme === 'dark'
                      ? Colors.dark.card
                      : Colors.light.card,
                },
                headerTransparent: Platform.OS === 'ios',
                headerLargeTitle: false,
                title: '',
                presentation:
                  Platform.OS === 'ios'
                    ? isLiquidGlassAvailable() && osName !== 'iPadOS'
                      ? 'formSheet'
                      : 'modal'
                    : 'modal',
                sheetInitialDetentIndex: 0,
                headerStyle: {
                  backgroundColor:
                    Platform.OS === 'ios' ? 'transparent' : colorScheme === 'dark' ? Colors.dark.card : Colors.light.card,
                },
                headerBlurEffect: isLiquidGlassAvailable() ? undefined : colorScheme === 'dark' ? 'dark' : 'light',
              }}
            /> */}
            <Stack.Screen name="+not-found" />
          </Stack>
  )
}


export default function RootLayout() {
  const colorScheme = useColorScheme() || 'light';
  const [fatalError, setFatalError] = useState<Error | null>(null);

  useEffect(() => {
    const errorUtils = (globalThis as typeof globalThis & { ErrorUtils?: ErrorUtilsShape }).ErrorUtils;
    const previousGlobalHandler = errorUtils?.getGlobalHandler?.();

    const reportFatalError = (rawError: unknown) => {
      const normalizedError = rawError instanceof Error ? rawError : new Error(String(rawError));
      setFatalError(normalizedError);
    };

    errorUtils?.setGlobalHandler?.((error: unknown, isFatal?: boolean) => {
      if (isFatal) {
        reportFatalError(error);
      }
      previousGlobalHandler?.(error, isFatal);
    });

    if (Platform.OS !== 'web') {
      return () => {
        if (previousGlobalHandler) {
          errorUtils?.setGlobalHandler?.(previousGlobalHandler);
        }
      };
    }

    const onWindowError = (event: ErrorEvent) => {
      reportFatalError(event.error ?? event.message);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportFatalError(event.reason);
    };

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      if (previousGlobalHandler) {
        errorUtils?.setGlobalHandler?.(previousGlobalHandler);
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(colorScheme === 'light' ? 'dark' : 'light');
    }
  }, [colorScheme]);

  // Keep the root view background color in sync with the current theme
  useEffect(() => {
    setBackgroundColorAsync(colorScheme === 'dark' ? Colors.dark.background : Colors.light.background);
  }, [colorScheme]);

  if (fatalError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <GlobalErrorFallback
            title="Erreur fatale interceptée"
            message={fatalError.message}
          />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} animated={true} />
          <InitialLayout />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
