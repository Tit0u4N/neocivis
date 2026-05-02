import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/providers/AuthProvider';

export default function AccountScreen() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { language, availableLanguages, setLanguage } = useSettings();

  return (
    <View style={styles.root}>
      <AppTopBar />
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

        <Button variant="destructive" onPress={logout} style={styles.signOut}>
          {t('account.signOut')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
