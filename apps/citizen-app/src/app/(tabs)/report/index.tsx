import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBadge } from '@/components/report/StatusBadge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
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

        <View style={[styles.list, { borderColor, backgroundColor: cardColor }]}>
          <View style={[styles.listHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.colLabel, { color: mutedColor, flex: 1 }]}>{t('report.columns.subject')}</Text>
            <Text style={[styles.colLabel, { color: mutedColor, width: 60, textAlign: 'center' }]}>
              {t('report.columns.date')}
            </Text>
            <Text style={[styles.colLabel, { color: mutedColor, width: 90, textAlign: 'right' }]}>
              {t('report.columns.status')}
            </Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text variant="caption">{t('report.noReports')}</Text>
            </View>
          ) : (
            filtered.map((report, idx) => (
              <TouchableOpacity
                key={report.id}
                onPress={() => navigateToDetail(report.id)}
                activeOpacity={0.7}
                style={[styles.row, { borderBottomColor: borderColor }, idx === filtered.length - 1 && styles.rowLast]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontWeight: '600', color: textColor, fontSize: 15 }} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: mutedColor }}>
                    {report.type} · #{report.id}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: mutedColor, width: 60, textAlign: 'center' }}>{report.date}</Text>
                <View style={{ width: 90, alignItems: 'flex-end' }}>
                  <StatusBadge status={report.status} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
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
  list: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  rowLast: { borderBottomWidth: 0 },
  empty: { padding: 24, alignItems: 'center' },
});
