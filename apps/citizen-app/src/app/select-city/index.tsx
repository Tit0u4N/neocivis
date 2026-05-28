import type { CityPublicDto } from '@repo/contracts';
import { ChevronRight, Search, X } from 'lucide-react-native';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, type TextInput, TouchableOpacity } from 'react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useSelectCity } from '@/screens/select-city/useSelectCity';

export default function SelectCityScreen() {
  const { t } = useTranslation();
  const { cities, loading, error, query, setQuery, onSelect, joiningId } = useSelectCity();
  const inputRef = useRef<TextInput>(null);

  const primaryColor = useColor('primary');
  const mutedColor = useColor('textMuted');
  const borderColor = useColor('border');
  const errorColor = useColor('red');
  const mutedBg = useColor('muted');
  const cardBg = useColor('card');
  const textColor = useColor('text');

  const clearButton = query ? (
    <TouchableOpacity
      onPress={() => {
        setQuery('');
        inputRef.current?.focus();
      }}
      style={[styles.clearBtn, { backgroundColor: mutedBg }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <X size={14} color={mutedColor} />
    </TouchableOpacity>
  ) : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">{t('selectCity.title')}</Text>
        <Text style={[styles.subtitle, { color: mutedColor }]}>{t('selectCity.subtitle')}</Text>
      </View>

      <View style={styles.searchWrap}>
        <Input
          ref={inputRef}
          icon={Search}
          placeholder={t('selectCity.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          rightComponent={clearButton}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {error ? <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text> : null}

          <View style={styles.sectionRow}>
            <Text style={[styles.sectionLabel, { color: mutedColor }]}>
              {query ? t('selectCity.results') : t('selectCity.allCities')}
            </Text>
            <Text style={[styles.sectionCount, { color: mutedColor }]}>
              {t('selectCity.cityCount', { count: cities.length })}
            </Text>
          </View>

          {cities.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor }]}>
              <Text style={[styles.emptyTitle, { color: textColor }]}>{t('selectCity.empty')}</Text>
              <Text style={[styles.emptyHelper, { color: mutedColor }]}>{t('selectCity.emptyHelper')}</Text>
            </View>
          ) : (
            <View style={[styles.listBox, { borderColor, backgroundColor: cardBg }]}>
              {cities.map((city, i) => (
                <CityRow
                  key={city.id}
                  city={city}
                  onSelect={onSelect}
                  joiningId={joiningId}
                  isLast={i === cities.length - 1}
                  borderColor={borderColor}
                  primaryColor={primaryColor}
                  mutedColor={mutedColor}
                  mutedBg={mutedBg}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function CityRow({
  city,
  onSelect,
  joiningId,
  isLast,
  borderColor,
  primaryColor,
  mutedColor,
  mutedBg,
}: {
  city: CityPublicDto;
  onSelect: (city: CityPublicDto) => Promise<void>;
  joiningId: string | null;
  isLast: boolean;
  borderColor: string;
  primaryColor: string;
  mutedColor: string;
  mutedBg: string;
}) {
  const isJoining = joiningId === city.id;
  const isDisabled = joiningId !== null;

  return (
    <TouchableOpacity
      onPress={() => void onSelect(city)}
      disabled={isDisabled}
      style={[
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: borderColor },
        isDisabled && !isJoining && styles.rowDisabled,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: mutedBg }]}>
        <Text style={[styles.avatarText, { color: primaryColor }]}>{city.name.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.rowText}>
        <Text style={styles.cityName}>{city.name}</Text>
        {city.description ? (
          <Text style={[styles.cityDesc, { color: mutedColor }]} numberOfLines={1}>
            {city.description}
          </Text>
        ) : null}
      </View>

      {isJoining ? (
        <ActivityIndicator size="small" color={mutedColor} />
      ) : (
        <ChevronRight size={18} color={mutedColor} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 4,
    gap: 4,
  },
  subtitle: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 8 },
  errorText: { fontSize: 13 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginHorizontal: 4,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionCount: { fontSize: 11, fontWeight: '600' },
  listBox: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  emptyBox: {
    padding: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { fontWeight: '700', fontSize: 15, textAlign: 'center' },
  emptyHelper: { fontSize: 13, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowDisabled: { opacity: 0.5 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontWeight: '800', fontSize: 15 },
  rowText: { flex: 1, minWidth: 0 },
  cityName: { fontWeight: '700', fontSize: 15 },
  cityDesc: { fontSize: 12, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
