import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import type { Category } from '@/screens/city/useHomeScreen';
import { getCategoryLinkAction } from '@/utils/categoryLink.util';
import { hexToGradient } from '@/utils/color.util';
import { resolveIcon } from '@/utils/icon.util';
import { useCategoryLayout } from './useCategoryLayout';

const GRID_GAP = 10;
const GRID_COLS = 3;
const SIDE_PADDING = 32; // 16px each side
const CELL_HEIGHT = 110;

interface CategoryTileProps {
  category: Category;
}

function CategoryTile({ category }: CategoryTileProps) {
  const IconComponent = resolveIcon(category.icon);
  const [gradStart, gradEnd] = hexToGradient(category.color);

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.tileTouchable} onPress={getCategoryLinkAction(category.link)}>
      <LinearGradient colors={[gradStart, gradEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
          <IconComponent color={category.color} size={20} strokeWidth={1.8} />
        </View>
        <Text style={[styles.tileName, { color: category.color }]} numberOfLines={2}>
          {category.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const { width } = useWindowDimensions();
  const containerWidth = width - SIDE_PADDING;
  const colWidth = (containerWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

  const { placed, totalRows } = useCategoryLayout(categories);

  if (placed.length === 0 || totalRows === 0) {
    return null;
  }

  const containerHeight = totalRows * CELL_HEIGHT + (totalRows - 1) * GRID_GAP;

  return (
    <View style={{ height: containerHeight, position: 'relative' }}>
      {placed.map(({ category, row, col, colSpan, rowSpan }) => {
        const left = col * (colWidth + GRID_GAP);
        const top = row * (CELL_HEIGHT + GRID_GAP);
        const tileWidth = colSpan * colWidth + (colSpan - 1) * GRID_GAP;
        const tileHeight = rowSpan * CELL_HEIGHT + (rowSpan - 1) * GRID_GAP;
        return (
          <View key={category.id} style={{ position: 'absolute', left, top, width: tileWidth, height: tileHeight }}>
            <CategoryTile category={category} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tileTouchable: {
    flex: 1,
  },
  tile: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10,
    overflow: 'hidden',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
});
