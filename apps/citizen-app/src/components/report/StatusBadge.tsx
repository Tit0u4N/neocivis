import { StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import type { ReportStatus } from '@/screens/report/report.types';

interface StatusBadgeProps {
  status: ReportStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const orange = useColor('orange');
  const blue = useColor('blue');
  const green = useColor('green');
  const muted = useColor('textMuted');

  const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
    pending: { label: 'En attente', color: orange },
    progress: { label: 'En cours', color: blue },
    resolved: { label: 'Résolu', color: green },
    cancelled: { label: 'Annulé', color: muted },
  };

  const { label, color } = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: `${color}26` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
