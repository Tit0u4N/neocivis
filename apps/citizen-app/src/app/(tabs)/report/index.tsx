import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBadge } from '@/components/report/StatusBadge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { formatReportDate } from '@/screens/report/report.types';
import { FILTER_OPTIONS, useReportsList } from '@/screens/report/useReportsList';

export default function ReportListScreen() {
  const { t } = useTranslation();
  const { filter, setFilter, filtered, navigateToNew, navigateToDetail } = useReportsList();
  const borderColor = useColor('border');
  const cardColor = useColor('card');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');
  const primaryFgColor = useColor('primaryForeground');
  const textColor = useColor('text');

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll}>
      <View style={styles.container}>
        <Text variant="heading">{t('report.title')}</Text>
        <Text variant="caption" style={{ marginTop: -4 }}>
          {t('report.subtitle')}
        </Text>

        <Button icon={Plus} label={t('report.newReport')} onPress={navigateToNew} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_OPTIONS.map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? primaryColor : cardColor,
                    borderColor: active ? primaryColor : borderColor,
                  },
                ]}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? primaryFgColor : textColor }}>
                  {t(f.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text variant="subtitle" style={{ marginTop: 4 }}>
          {t('report.myReports')}
        </Text>

        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: cardColor, borderColor }]}>
            <Text variant="caption">{t('report.noReports')}</Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {filtered.map((report) => (
              <TouchableOpacity
                key={report.id}
                onPress={() => navigateToDetail(report.id)}
                activeOpacity={0.7}
                style={[styles.card, { backgroundColor: cardColor, borderColor }]}
              >
                <View style={styles.cardTop}>
                  <Text style={{ fontWeight: '600', color: textColor, fontSize: 15, flex: 1 }} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <StatusBadge status={report.status} />
                </View>
                <Text style={{ fontSize: 12, color: mutedColor }}>{formatReportDate(report.createdAt)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 16, gap: 18, paddingBottom: 40 },
  filterScroll: { marginHorizontal: -16 },
  filterContent: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  cardList: { gap: 10 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
});
