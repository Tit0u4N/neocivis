import type { LucideProps } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import type { ComponentType } from 'react';

const Icons = LucideIcons as unknown as Record<string, ComponentType<LucideProps>>;

export function resolveIcon(name: string): ComponentType<LucideProps> {
  return Icons[name] ?? Icons.Newspaper;
}
