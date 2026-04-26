import { router, Stack, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View as RnView, ScrollView, StyleSheet } from 'react-native';
import { StatusBadge } from '@/components/report/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useReportDetails } from '@/screens/report/useReportDetails';
import { BORDER_RADIUS } from '@/theme/globals';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { report, showCancelDialog, openCancelDialog, closeCancelDialog, confirmCancel } = useReportDetails(id);
  const mutedColor = useColor('textMuted');
  const borderColor = useColor('border');
  const cardColor = useColor('card');
  const primaryColor = useColor('primary');
  const bgMuted = useColor('muted');
  const greenColor = useColor('green');

  if (!report) {
    return (
      <>
        <Stack.Screen options={{ title: t('report.detail.headerTitle') }} />
        <View style={styles.notFound}>
          <Text variant="caption">{t('report.notFound')}</Text>
        </View>
      </>
    );
  }

  const canCancel = report.status !== 'cancelled' && report.status !== 'resolved';

  return (
    <>
      <Stack.Screen options={{ title: t('report.detail.headerTitle') }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll}>
        <View style={styles.container}>
          <Text variant="heading" style={{ lineHeight: 34 }}>
            {report.title}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <StatusBadge status={report.status} />
            <Text style={{ fontSize: 12, color: mutedColor }}>· #{report.id}</Text>
          </View>

          <Card>
            <View style={styles.infoItem}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>{t('report.detail.date')}</Text>
              <Text style={styles.metaValue}>{report.date}</Text>
            </View>
            <View style={[styles.divider, { borderColor }]} />
            <View style={styles.infoItem}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>{t('report.detail.type')}</Text>
              <Text style={styles.metaValue}>{report.type}</Text>
            </View>
            <View style={[styles.divider, { borderColor }]} />
            <View style={styles.infoItem}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>{t('report.detail.description')}</Text>
              <Text style={{ marginTop: 4, fontSize: 14, color: mutedColor, lineHeight: 20 }}>{report.desc}</Text>
            </View>
          </Card>

          <View style={[styles.locationCard, { backgroundColor: cardColor, borderColor }]}>
            <MapPin size={24} color={primaryColor} />
            <Text style={{ fontSize: 12, color: mutedColor, fontWeight: '600' }}>12 rue Pasteur, 13001 Marseille</Text>
          </View>

          <Card style={{ backgroundColor: bgMuted }}>
            <Text style={[styles.metaLabel, { color: mutedColor, marginBottom: 12 }]}>
              {t('report.detail.tracking')}
            </Text>
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: greenColor }]} />
                <View>
                  <Text style={{ fontWeight: '600', fontSize: 13 }}>{t('report.detail.received')}</Text>
                  <Text style={{ fontSize: 11, color: mutedColor }}>{report.date} · 14:32</Text>
                </View>
              </View>
              {report.status !== 'pending' && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: greenColor }]} />
                  <View>
                    <Text style={{ fontWeight: '600', fontSize: 13 }}>{t('report.detail.takenCare')}</Text>
                    <Text style={{ fontSize: 11, color: mutedColor }}>{t('report.detail.takenCareAgo')}</Text>
                  </View>
                </View>
              )}
              {report.status === 'resolved' && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: greenColor }]} />
                  <View>
                    <Text style={{ fontWeight: '600', fontSize: 13 }}>{t('report.detail.resolved')}</Text>
                    <Text style={{ fontSize: 11, color: mutedColor }}>{t('report.detail.resolvedAgo')}</Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          <View style={styles.actions}>
            <Button variant="secondary" label={t('report.detail.back')} onPress={() => router.back()} />
            {canCancel && (
              <Button
                variant="destructive"
                label={t('report.detail.cancelReport')}
                onPress={openCancelDialog}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showCancelDialog} transparent animationType="slide" onRequestClose={closeCancelDialog}>
        <RnView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeCancelDialog} />
          <View style={[styles.dialogSheet, { backgroundColor: cardColor }]}>
            <View style={[styles.warningIcon, { backgroundColor: `${primaryColor}15` }]}>
              <AlertTriangle size={28} color={primaryColor} />
            </View>
            <Text variant="subtitle" style={{ textAlign: 'center' }}>
              {t('report.cancel.title')}
            </Text>
            <Text variant="caption" style={{ textAlign: 'center', marginVertical: 4 }}>
              {t('report.cancel.subtitle')}
            </Text>
            <View style={styles.dialogActions}>
              <Button
                variant="secondary"
                label={t('report.cancel.keep')}
                onPress={closeCancelDialog}
                style={{ flex: 1 }}
              />
              <Button
                variant="destructive"
                label={t('report.cancel.confirm')}
                onPress={confirmCancel}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </RnView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 16, gap: 16, paddingBottom: 40 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  infoItem: { gap: 2, paddingVertical: 4 },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaValue: { fontWeight: '600', fontSize: 15, marginTop: 2 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, marginVertical: 4 },
  locationCard: {
    height: 120,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  timeline: { gap: 12 },
  timelineItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  dialogSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    gap: 12,
    alignItems: 'center',
  },
  warningIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dialogActions: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 },
});
