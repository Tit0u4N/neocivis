import { KeyRound, LogOut, Pencil } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View as RnView, ScrollView, StyleSheet } from 'react-native';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useSettings } from '@/hooks/useSettings';
import { useAccountScreen } from '@/screens/account/useAccountScreen';
import { BORDER_RADIUS } from '@/theme/globals';

type FormFieldKey = 'firstName' | 'lastName' | 'username' | 'email';
const FIELD_KEYS: FormFieldKey[] = ['firstName', 'lastName', 'username', 'email'];

export default function AccountScreen() {
  const { t } = useTranslation();
  const { language, availableLanguages, setLanguage } = useSettings();
  const {
    form,
    isLoading,
    loadError,
    editingField,
    editingValue,
    editingError,
    isEditSubmitting,
    passwordSheetOpen,
    isPasswordSubmitting,
    passwordError,
    passwordSuccess,
    openEditField,
    setEditingValue,
    confirmEditField,
    closeEditField,
    openPasswordSheet,
    closePasswordSheet,
    confirmPasswordReset,
    handleLogout,
  } = useAccountScreen();

  const cardColor = useColor('card');
  const borderColor = useColor('border');
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');
  const redColor = useColor('red');
  const bgColor = useColor('background');
  const greenColor = useColor('green');

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <AppTopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="heading">{t('account.title')}</Text>

        {/* Section profil */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedColor }]}>{t('account.profile.title')}</Text>

          {isLoading ? (
            <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
              <View style={styles.loadingRow}>
                <Spinner size="sm" />
                <Text variant="caption" style={{ color: mutedColor }}>
                  Chargement…
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
              {loadError && (
                <View style={[styles.banner, { backgroundColor: `${redColor}15`, borderColor: `${redColor}40` }]}>
                  <Text style={{ color: redColor, fontSize: 13 }}>{loadError}</Text>
                </View>
              )}
              {FIELD_KEYS.map((field, index) => (
                <View key={field}>
                  <Pressable
                    style={styles.fieldRow}
                    onPress={() => openEditField(field)}
                    accessibilityRole="button"
                    accessibilityLabel={t('account.profile.editAria', { field: t(`account.profile.fields.${field}`) })}
                  >
                    <View style={styles.fieldTexts}>
                      <Text style={[styles.fieldLabel, { color: mutedColor }]}>
                        {t(`account.profile.fields.${field}`)}
                      </Text>
                      <Text style={[styles.fieldValue, { color: textColor }]}>{form[field] || '—'}</Text>
                    </View>
                    <Pencil size={16} color={mutedColor} strokeWidth={1.8} />
                  </Pressable>
                  {index < FIELD_KEYS.length - 1 && <View style={[styles.divider, { borderColor }]} />}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Section mot de passe */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedColor }]}>{t('account.password.title')}</Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            {passwordError && (
              <View style={[styles.banner, { backgroundColor: `${redColor}15`, borderColor: `${redColor}40` }]}>
                <Text style={{ color: redColor, fontSize: 13 }}>{passwordError}</Text>
              </View>
            )}
            {passwordSuccess && (
              <View style={[styles.banner, { backgroundColor: `${greenColor}15`, borderColor: `${greenColor}40` }]}>
                <Text style={{ color: greenColor, fontSize: 13 }}>{passwordSuccess}</Text>
              </View>
            )}
            <Text style={{ color: mutedColor, fontSize: 14, marginBottom: 12 }}>
              {t('account.password.description')}
            </Text>
            <Button
              variant="outline"
              icon={KeyRound}
              label={t('account.password.button')}
              onPress={openPasswordSheet}
            />
          </View>
        </View>

        {/* Section langue */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedColor }]}>{t('account.language.label')}</Text>
          <View style={styles.row}>
            {availableLanguages.map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? 'default' : 'outline'}
                size="sm"
                label={t(`account.language.${lang}`)}
                onPress={() => setLanguage(lang)}
                style={styles.rowItem}
              />
            ))}
          </View>
        </View>

        {/* Déconnexion */}
        <Button
          variant="destructive"
          icon={LogOut}
          label={t('account.signOut')}
          onPress={handleLogout}
          style={styles.signOut}
        />
      </ScrollView>

      {/* Bottom-sheet édition champ */}
      <Modal visible={editingField !== null} transparent animationType="slide" onRequestClose={closeEditField}>
        <RnView style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeEditField} />
          <View style={[styles.sheet, { backgroundColor: cardColor }]}>
            <Text variant="subtitle" style={{ marginBottom: 4 }}>
              {editingField ? t(`account.profile.fields.${editingField}`) : null}
            </Text>
            {editingField && (
              <Text style={{ color: mutedColor, fontSize: 13, marginBottom: 16 }}>
                {t(`account.profile.fieldHints.${editingField}`)}
              </Text>
            )}
            <Input
              value={editingValue}
              onChangeText={setEditingValue}
              keyboardType={editingField === 'email' ? 'email-address' : 'default'}
              autoCapitalize="none"
              autoFocus
              error={editingError ?? undefined}
              placeholder={editingField ? t(`account.profile.fields.${editingField}`) : undefined}
            />
            <View style={styles.sheetActions}>
              <Button
                variant="secondary"
                label={t('account.cancel')}
                onPress={closeEditField}
                disabled={isEditSubmitting}
                style={{ flex: 1 }}
              />
              <Button
                label={t('account.save')}
                onPress={() => void confirmEditField()}
                disabled={isEditSubmitting}
                loading={isEditSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </RnView>
      </Modal>

      {/* Bottom-sheet confirmation mot de passe */}
      <Modal visible={passwordSheetOpen} transparent animationType="slide" onRequestClose={closePasswordSheet}>
        <RnView style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closePasswordSheet} />
          <View style={[styles.sheet, { backgroundColor: cardColor }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${primaryColor}15` }]}>
              <KeyRound size={28} color={primaryColor} strokeWidth={1.8} />
            </View>
            <Text variant="subtitle" style={{ textAlign: 'center' }}>
              {t('account.passwordDialog.title')}
            </Text>
            <Text variant="caption" style={{ textAlign: 'center', marginVertical: 4 }}>
              {t('account.passwordDialog.description', { email: form.email })}
            </Text>
            <View style={styles.sheetActions}>
              <Button
                variant="secondary"
                label={t('account.passwordDialog.cancel')}
                onPress={closePasswordSheet}
                disabled={isPasswordSubmitting}
                style={{ flex: 1 }}
              />
              <Button
                label={t('account.passwordDialog.confirm')}
                onPress={() => void confirmPasswordReset()}
                disabled={isPasswordSubmitting}
                loading={isPasswordSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </RnView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 24, paddingBottom: 40 },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginLeft: 4,
  },
  card: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    padding: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  fieldTexts: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldValue: { fontSize: 15, fontWeight: '500' },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  signOut: { marginTop: 8 },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    gap: 12,
  },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
});
