import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, availableLanguages, setLanguage } = useSettings();

  return (
    <View style={styles.container}>
      <Text variant="heading">{t('settings.title')}</Text>

      <View style={styles.section}>
        <Text variant="body" style={styles.label}>
          {t('settings.language.label')}
        </Text>
        <View style={styles.languageRow}>
          {availableLanguages.map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? 'default' : 'outline'}
              size="sm"
              onPress={() => setLanguage(lang)}
              style={styles.languageButton}
            >
              {t(`settings.language.${lang}`)}
            </Button>
          ))}
        </View>
      </View>
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
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
  },
});
