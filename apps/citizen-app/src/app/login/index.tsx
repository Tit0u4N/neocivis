import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useLoginScreen } from './useLoginScreen';

export default function LoginScreen() {
  const { isLoading, onSignIn } = useLoginScreen();
  const backgroundColor = useColor('background');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 48 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text variant="heading">Bienvenue</Text>
          <Text variant="caption" style={{ textAlign: 'center' }}>
            Connectez-vous pour accéder à l'application.
          </Text>
        </View>

        {isLoading ? (
          <Spinner size="lg" />
        ) : (
          <Button
            size="lg"
            onPress={() => {
              void onSignIn();
            }}
          >
            Se connecter avec Keycloak
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
