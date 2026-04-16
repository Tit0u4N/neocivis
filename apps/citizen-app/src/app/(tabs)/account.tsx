import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useModeToggle } from '@/hooks/useModeToggle';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/providers/AuthProvider';
type ThemeMode = 'light' | 'dark' | 'system';

export default function AccountScreen() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { language, availableLanguages, setLanguage } = useSettings();
  const { mode, setMode } = useModeToggle();

  const themeModes: ThemeMode[] = ['light', 'dark', 'system'];

  return (
    <View style={styles.container}>
      <Text variant="heading">{t('account.title')}</Text>

      <View style={styles.section}>
        <Text variant="body" style={styles.label}>
          {t('account.language.label')}
        </Text>
        <View style={styles.row}>
          {availableLanguages.map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? 'default' : 'outline'}
              size="sm"
              onPress={() => setLanguage(lang)}
              style={styles.rowItem}
            >
              {t(`account.language.${lang}`)}
            </Button>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="body" style={styles.label}>
          {t('account.theme.label')}
        </Text>
        <View style={styles.row}>
          {themeModes.map((m) => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'outline'}
              size="sm"
              onPress={() => setMode(m)}
              style={styles.rowItem}
            >
              {t(`account.theme.${m}`)}
            </Button>
          ))}
        </View>
      </View>

      <Button variant="destructive" onPress={logout} style={styles.signOut}>
        {t('account.signOut')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  label: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  signOut: {
    marginTop: 'auto',
  },
});
