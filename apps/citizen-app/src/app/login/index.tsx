import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';
import {Spinner} from "@/components/ui/spinner";
import {useLoginScreen} from "@/app/login/useLoginScreen";

export default function LoginScreen() {
  const { isLoading, onSignIn } = useLoginScreen();
  const { t } = useTranslation();

  const backgroundColor = useColor('background');
  const foregroundColor = useColor('foreground');
  const mutedForegroundColor = useColor('mutedForeground');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.brandName, { color: foregroundColor }]}>{t('login.brand')}</Text>

      {isLoading ? (
          <Spinner size="lg" />
        ) : (
      <View style={styles.centerBlock}>
        <Text style={[styles.title, { color: foregroundColor }]}>{t('login.title')}</Text>
        <Text style={[styles.subtitle, { color: mutedForegroundColor }]}>{t('login.subtitle')}</Text>

        <View style={styles.buttons}>
          <Button variant="outline" style={styles.button} onPress={onSignIn}>
            {t('login.signUp')}
          </Button>
          <Button variant="default" style={styles.button} onPress={onSignIn}>
            {t('login.signIn')}
          </Button>
        </View>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 48,
    gap: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 56,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 8,
    height: 56,
  },
  guestLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 4,
  },
});
