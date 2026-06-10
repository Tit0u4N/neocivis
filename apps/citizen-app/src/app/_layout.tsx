import '@/i18n';
import * as NavigationBar from 'expo-navigation-bar';
import type { ErrorBoundaryProps, Href } from 'expo-router';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ApiProvider } from '@/providers/ApiProvider';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ServicesProvider } from '@/providers/ServicesProvider';
import { ArticlesProvider } from '@/stores/articles.store';
import { CityProvider, useCityStore } from '@/stores/city.store';
import { ProfileProvider, useProfile } from '@/stores/profile.store';
import { UserProvider } from '@/stores/user.store';
import { Colors } from '@/theme/colors';
import { ThemeProvider } from '@/theme/theme-provider';
import 'react-native-reanimated';
import { ToastProvider } from '@/components/ui/toast';

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;

type ErrorUtilsShape = {
  getGlobalHandler?: () => GlobalErrorHandler | undefined;
  setGlobalHandler?: (handler: GlobalErrorHandler) => void;
};

SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

function GlobalErrorFallback({ title, message }: { title: string; message: string }) {
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
  return <GlobalErrorFallback title="Une erreur est survenue" message={error?.message ?? 'Erreur inconnue.'} />;
}

function InitialLayout() {
  useColorScheme() || 'light';
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { cityId, setCityId, setCity } = useCityStore();
  const segments = useSegments();
  const router = useRouter();

  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    const isLoading = authLoading || (isAuthenticated && profileLoading);
    if (isLoading) {
      return;
    }

    const seg0 = segments[0] as string;
    const inTabsGroup = seg0 === '(tabs)';
    const isLoginPage = seg0 === 'login';
    const isSelectCityPage = seg0 === 'select-city';

    const navigationTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        if (!isLoginPage) {
          router.replace('/login');
        }
      } else if (profile === null) {
        // Profil non chargé (erreur réseau) → retour au login
        if (!isLoginPage) {
          router.replace('/login');
        }
      } else if (profile.memberships.length === 0) {
        // Citoyen sans ville → écran de sélection
        if (!isSelectCityPage) {
          router.replace('/select-city' as Href);
        }
      } else {
        // Citoyen avec au moins une ville → auto-sélectionner la 1ère
        const firstCity = profile.memberships[0];
        if (cityId !== firstCity.id) {
          setCityId(firstCity.id);
          setCity(firstCity);
        }
        if (!inTabsGroup) {
          router.replace('/(tabs)/(city)');
        }
      }
    }, 0);

    return () => clearTimeout(navigationTimeout);
  }, [
    isAuthenticated,
    authLoading,
    profileLoading,
    profile,
    cityId,
    setCityId,
    setCity,
    segments,
    rootNavigationState?.key,
    router.replace,
  ]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="login/index" options={{ headerShown: false }} />
      <Stack.Screen name="select-city/index" options={{ headerShown: false }} />

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
  );
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

  const bgColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  if (fatalError) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
        <ThemeProvider>
          <GlobalErrorFallback title="Erreur fatale interceptée" message={fatalError.message} />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
      <LanguageProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ApiProvider>
                <CityProvider>
                  <ServicesProvider>
                    <UserProvider>
                      <ArticlesProvider>
                        <ProfileProvider>
                          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} animated={true} />
                          <InitialLayout />
                        </ProfileProvider>
                      </ArticlesProvider>
                    </UserProvider>
                  </ServicesProvider>
                </CityProvider>
              </ApiProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
