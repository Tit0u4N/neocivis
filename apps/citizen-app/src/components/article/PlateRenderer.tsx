/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: PlateJS AST renderer requires full structural traversal */
import type { ReactElement } from 'react';
import { Image, Linking, Text as RNText, ScrollView, type TextStyle, View } from 'react-native';
import { useColor } from '@/hooks/useColor';

type Colors = {
  text: string;
  muted: string;
  mutedBg: string;
  border: string;
  card: string;
  blue: string;
};

type TextLeaf = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
};

type PlateElement = {
  type: string;
  id?: string;
  url?: string;
  target?: string;
  children?: PlateNode[];
};

type PlateNode = TextLeaf | PlateElement;

function isTextLeaf(node: PlateNode): node is TextLeaf {
  return 'text' in node;
}

function normalizeContent(content: unknown): PlateNode[] {
  if (!content) {
    return [];
  }
  if (Array.isArray(content)) {
    return content as PlateNode[];
  }
  if (typeof content === 'object' && content !== null && 'content' in content) {
    const inner = (content as { content: unknown }).content;
    if (Array.isArray(inner)) {
      return inner as PlateNode[];
    }
  }
  return [];
}

function renderTextLeaf(node: TextLeaf, key: string, colors: Colors): ReactElement {
  const style: TextStyle[] = [{ fontSize: 16, lineHeight: 26, color: colors.text }];
  if (node.bold) {
    style.push({ fontWeight: '700' });
  }
  if (node.italic) {
    style.push({ fontStyle: 'italic' });
  }
  if (node.strikethrough) {
    style.push({ textDecorationLine: 'line-through' });
  }
  if (node.underline) {
    style.push({ textDecorationLine: 'underline' });
  }
  if (node.code) {
    style.push({ fontFamily: 'monospace', backgroundColor: colors.mutedBg, paddingHorizontal: 4, borderRadius: 3 });
  }
  return (
    <RNText key={key} style={style}>
      {node.text}
    </RNText>
  );
}

function renderInline(node: PlateNode, key: string, colors: Colors): ReactElement {
  if (isTextLeaf(node)) {
    return renderTextLeaf(node, key, colors);
  }
  const children = node.children ?? [];
  if (node.type === 'a') {
    const url = node.url ?? '';
    return (
      <RNText
        key={key}
        style={{ color: colors.blue, textDecorationLine: 'underline' }}
        onPress={() => {
          void Linking.openURL(url);
        }}
      >
        {children.map((child, i) => renderInline(child, `${key}-${i}`, colors))}
      </RNText>
    );
  }
  return <RNText key={key}>{children.map((child, i) => renderInline(child, `${key}-${i}`, colors))}</RNText>;
}

function renderParagraph(node: PlateElement, key: string, colors: Colors): ReactElement {
  const children = node.children ?? [];
  const hasImg = children.some((child) => !isTextLeaf(child) && (child as PlateElement).type === 'img');

  if (hasImg) {
    return (
      <View key={key} style={{ marginBottom: 8 }}>
        {children.map((child, i) => {
          if (!isTextLeaf(child) && (child as PlateElement).type === 'img') {
            const elem = child as PlateElement;
            return (
              <Image
                key={i}
                source={{ uri: elem.url }}
                style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 8, marginBottom: 4 }}
                resizeMode="cover"
              />
            );
          }
          if (isTextLeaf(child) && !child.text) {
            return null;
          }
          return renderInline(child, String(i), colors);
        })}
      </View>
    );
  }

  const isEmpty = children.every((child) => isTextLeaf(child) && !child.text);
  if (isEmpty) {
    return <View key={key} style={{ height: 8 }} />;
  }

  return (
    <RNText key={key} style={{ fontSize: 16, lineHeight: 26, color: colors.text, marginBottom: 8 }}>
      {children.map((child, i) => renderInline(child, String(i), colors))}
    </RNText>
  );
}

function renderHeading(node: PlateElement, key: string, level: 1 | 2 | 3, colors: Colors): ReactElement {
  const headingStyles: Record<number, TextStyle> = {
    1: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 16, marginBottom: 8 },
    2: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 6 },
    3: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 8, marginBottom: 4 },
  };
  return (
    <RNText key={key} style={headingStyles[level]}>
      {(node.children ?? []).map((child, i) => renderInline(child, String(i), colors))}
    </RNText>
  );
}

function renderListItem(node: PlateElement, key: string, bullet: string, depth: number, colors: Colors): ReactElement {
  const children = node.children ?? [];
  const licNode = children.find((c): c is PlateElement => !isTextLeaf(c) && (c as PlateElement).type === 'lic');
  const nestedList = children.find(
    (c): c is PlateElement => !isTextLeaf(c) && ['ul', 'ol'].includes((c as PlateElement).type),
  );

  return (
    <View key={key} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <RNText style={{ fontSize: 16, color: colors.text, lineHeight: 26, minWidth: 20 }}>{bullet}</RNText>
      <View style={{ flex: 1 }}>
        {licNode ? (
          <RNText style={{ fontSize: 16, lineHeight: 26, color: colors.text }}>
            {(licNode.children ?? []).map((child, i) => renderInline(child, String(i), colors))}
          </RNText>
        ) : null}
        {nestedList ? renderList(nestedList, 'nested', nestedList.type === 'ol', depth + 1, colors) : null}
      </View>
    </View>
  );
}

function renderList(node: PlateElement, key: string, ordered: boolean, depth: number, colors: Colors): ReactElement {
  const children = node.children ?? [];
  return (
    <View key={key} style={{ marginBottom: depth === 0 ? 8 : 4, gap: 4, marginLeft: depth > 0 ? 16 : 0 }}>
      {children.map((child, i) => {
        if (!isTextLeaf(child) && (child as PlateElement).type === 'li') {
          const bullet = ordered ? `${i + 1}.` : '•';
          return renderListItem(child as PlateElement, String(i), bullet, depth, colors);
        }
        return null;
      })}
    </View>
  );
}

function renderBlockquote(node: PlateElement, key: string, colors: Colors): ReactElement {
  return (
    <View
      key={key}
      style={{ borderLeftWidth: 4, borderLeftColor: colors.muted, paddingLeft: 16, marginBottom: 8, opacity: 0.8 }}
    >
      {(node.children ?? []).map((child, i) => renderBlock(child, String(i), colors))}
    </View>
  );
}

function renderTableCell(node: PlateElement, key: string, isHeader: boolean, colors: Colors): ReactElement {
  return (
    <View
      key={key}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 80,
        backgroundColor: isHeader ? colors.card : 'transparent',
      }}
    >
      {(node.children ?? []).map((child, i) => {
        if (!isTextLeaf(child) && (child as PlateElement).type === 'p') {
          const p = child as PlateElement;
          return (
            <RNText key={i} style={{ fontSize: 14, color: colors.text, fontWeight: isHeader ? '700' : '400' }}>
              {(p.children ?? []).map((textChild, j) => renderInline(textChild, String(j), colors))}
            </RNText>
          );
        }
        return null;
      })}
    </View>
  );
}

function renderTable(node: PlateElement, key: string, colors: Colors): ReactElement {
  return (
    <ScrollView key={key} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      <View>
        {(node.children ?? []).map((child, i) => {
          if (!isTextLeaf(child) && (child as PlateElement).type === 'tr') {
            const row = child as PlateElement;
            return (
              <View key={i} style={{ flexDirection: 'row' }}>
                {(row.children ?? []).map((cell, j) => {
                  if (!isTextLeaf(cell)) {
                    const cellElem = cell as PlateElement;
                    if (cellElem.type === 'th') {
                      return renderTableCell(cellElem, String(j), true, colors);
                    }
                    if (cellElem.type === 'td') {
                      return renderTableCell(cellElem, String(j), false, colors);
                    }
                  }
                  return null;
                })}
              </View>
            );
          }
          return null;
        })}
      </View>
    </ScrollView>
  );
}

function renderBlock(node: PlateNode, key: string, colors: Colors): ReactElement | null {
  if (isTextLeaf(node)) {
    return renderTextLeaf(node, key, colors);
  }
  switch (node.type) {
    case 'h1':
      return renderHeading(node, key, 1, colors);
    case 'h2':
      return renderHeading(node, key, 2, colors);
    case 'h3':
      return renderHeading(node, key, 3, colors);
    case 'p':
      return renderParagraph(node, key, colors);
    case 'ul':
      return renderList(node, key, false, 0, colors);
    case 'ol':
      return renderList(node, key, true, 0, colors);
    case 'blockquote':
      return renderBlockquote(node, key, colors);
    case 'table':
      return renderTable(node, key, colors);
    case 'img': {
      return (
        <Image
          key={key}
          source={{ uri: node.url }}
          style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 8, marginBottom: 8 }}
          resizeMode="cover"
        />
      );
    }
    default:
      return null;
  }
}

export function PlateRenderer({ content }: { content: unknown }) {
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');
  const mutedBgColor = useColor('muted');
  const borderColor = useColor('border');
  const cardColor = useColor('card');
  const blueColor = useColor('blue');

  const colors: Colors = {
    text: textColor,
    muted: mutedColor,
    mutedBg: mutedBgColor,
    border: borderColor,
    card: cardColor,
    blue: blueColor,
  };
  const nodes = normalizeContent(content);

  return <View style={{ gap: 0 }}>{nodes.map((node, i) => renderBlock(node, String(i), colors))}</View>;
}
