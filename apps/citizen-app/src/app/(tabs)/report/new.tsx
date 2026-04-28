import { Stack } from 'expo-router';
import { Camera, Image as ImageIcon, Locate, MapPin, RefreshCw, Trash2, UploadCloud } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useNewReport } from '@/screens/report/useNewReport';

export default function NewReportScreen() {
  const { t } = useTranslation();
  const {
    desc,
    setDesc,
    photo,
    pickFromGallery,
    takePhoto,
    removePhoto,
    location,
    retryLocation,
    valid,
    submitting,
    submit,
    cancel,
  } = useNewReport();
  const borderColor = useColor('border');
  const cardColor = useColor('card');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');
  const redColor = useColor('red');
  const textColor = useColor('text');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ title: t('report.new.headerTitle') }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text variant="heading">{t('report.new.title')}</Text>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: mutedColor }]}>{t('report.new.description')}</Text>
            <Input
              type="textarea"
              rows={5}
              placeholder={t('report.new.descriptionPlaceholder')}
              value={desc}
              onChangeText={setDesc}
              maxLength={500}
            />
            <Text style={[styles.helperText, { color: mutedColor }]}>
              {desc.length}/500 {t('report.new.chars')}
            </Text>
          </View>

          {/* Photo */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: mutedColor }]}>{t('report.new.photo')}</Text>

            {photo.status === 'picked' ? (
              /* Preview with remove button */
              <View style={[styles.previewCard, { borderColor, backgroundColor: cardColor }]}>
                <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.previewFooter}>
                  <ImageIcon size={14} color={mutedColor} />
                  <Text style={{ flex: 1, fontSize: 12, color: mutedColor }} numberOfLines={1}>
                    {photo.fileName}
                  </Text>
                  <TouchableOpacity onPress={removePhoto} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={16} color={redColor} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Two-button picker */
              <View style={styles.photoRow}>
                <TouchableOpacity
                  onPress={takePhoto}
                  activeOpacity={0.7}
                  style={[styles.photoBtn, { borderColor, backgroundColor: cardColor }]}
                >
                  <Camera size={24} color={primaryColor} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: primaryColor, marginTop: 6 }}>
                    {t('report.new.photoCamera')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickFromGallery}
                  activeOpacity={0.7}
                  style={[styles.photoBtn, { borderColor, backgroundColor: cardColor }]}
                >
                  <UploadCloud size={24} color={primaryColor} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: primaryColor, marginTop: 6 }}>
                    {t('report.new.photoGallery')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* GPS Location */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: mutedColor }]}>{t('report.new.location')}</Text>
            <View style={[styles.locationCard, { backgroundColor: cardColor, borderColor }]}>
              {location.status === 'loading' && (
                <>
                  <ActivityIndicator color={primaryColor} />
                  <Text style={{ fontSize: 13, color: mutedColor, marginTop: 6 }}>
                    {t('report.new.locationLoading')}
                  </Text>
                </>
              )}
              {location.status === 'denied' && (
                <>
                  <MapPin size={24} color={redColor} />
                  <Text style={{ fontSize: 13, color: redColor, fontWeight: '600', textAlign: 'center' }}>
                    {t('report.new.locationDenied')}
                  </Text>
                  <TouchableOpacity onPress={retryLocation} style={styles.retryBtn}>
                    <RefreshCw size={14} color={primaryColor} />
                    <Text style={{ fontSize: 13, color: primaryColor, fontWeight: '600' }}>
                      {t('report.new.locationRetry')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {location.status === 'ready' && (
                <>
                  <View style={[styles.gpsBadge, { backgroundColor: `${primaryColor}12` }]}>
                    <Locate size={18} color={primaryColor} />
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textColor, letterSpacing: 0.3 }}>
                    {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                  </Text>
                  <TouchableOpacity onPress={retryLocation} style={styles.retryBtn}>
                    <RefreshCw size={13} color={mutedColor} />
                    <Text style={{ fontSize: 12, color: mutedColor }}>{t('report.new.locationRefresh')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button variant="secondary" label={t('report.new.cancel')} onPress={cancel} style={{ flex: 1 }} />
            <Button
              label={t('report.new.submit')}
              onPress={submit}
              disabled={!valid || submitting}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 16, gap: 20, paddingBottom: 40 },
  field: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },
  helperText: { fontSize: 12, marginLeft: 4 },
  photoRow: { flexDirection: 'row', gap: 10 },
  photoBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 180,
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  locationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  gpsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
