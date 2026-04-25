import { render, screen } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import { PlateRenderer } from '@/components/article/PlateRenderer';

vi.mock('@/hooks/useColor', () => ({
  useColor: (name: string) => {
    const palette: Record<string, string> = {
      text: '#111111',
      textMuted: '#888888',
      muted: '#cccccc',
      border: '#dddddd',
      card: '#f5f5f5',
      blue: '#0077cc',
    };
    return palette[name] ?? '#000000';
  },
}));

const p = (text: string, dec?: object) => ({ type: 'p', children: [{ text, ...dec }] });

describe('PlateRenderer', () => {
  describe('normalizeContent', () => {
    it('renders nothing for null', () => {
      render(<PlateRenderer content={null} />);
      expect(screen.queryByText(/.+/)).toBeNull();
    });

    it('renders nothing for unknown shape', () => {
      render(<PlateRenderer content={42} />);
      expect(screen.queryByText(/.+/)).toBeNull();
    });

    it('renders from plain array', () => {
      render(<PlateRenderer content={[p('Bonjour')]} />);
      expect(screen.getByText('Bonjour')).toBeTruthy();
    });

    it('renders from {content:[...]} wrapper', () => {
      render(<PlateRenderer content={{ content: [p('Enveloppé')] }} />);
      expect(screen.getByText('Enveloppé')).toBeTruthy();
    });
  });

  describe('headings', () => {
    it.each(['h1', 'h2', 'h3'])('renders %s', (type) => {
      const label = `Titre ${type}`;
      render(<PlateRenderer content={[{ type, children: [{ text: label }] }]} />);
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  describe('paragraph', () => {
    it('renders text content', () => {
      render(<PlateRenderer content={[p('Texte normal')]} />);
      expect(screen.getByText('Texte normal')).toBeTruthy();
    });

    it('empty paragraph renders without crash', () => {
      expect(() => render(<PlateRenderer content={[{ type: 'p', children: [{ text: '' }] }]} />)).not.toThrow();
    });
  });

  describe('text decorations', () => {
    it.each([
      ['Gras', { bold: true }],
      ['Italique', { italic: true }],
      ['Barré', { strikethrough: true }],
      ['Souligné', { underline: true }],
      ['Les deux', { strikethrough: true, underline: true }],
      ['snippet', { code: true }],
    ] as const)('renders %s', (label, dec) => {
      render(<PlateRenderer content={[p(label, dec)]} />);
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  describe('lists', () => {
    it('unordered list renders items and bullets', () => {
      render(
        <PlateRenderer
          content={[
            {
              type: 'ul',
              children: [
                { type: 'li', children: [{ type: 'lic', children: [{ text: 'Alpha' }] }] },
                { type: 'li', children: [{ type: 'lic', children: [{ text: 'Beta' }] }] },
              ],
            },
          ]}
        />,
      );
      expect(screen.getByText('Alpha')).toBeTruthy();
      expect(screen.getByText('Beta')).toBeTruthy();
      expect(screen.getAllByText('•')).toHaveLength(2);
    });

    it('ordered list renders numbers', () => {
      render(
        <PlateRenderer
          content={[
            {
              type: 'ol',
              children: [
                { type: 'li', children: [{ type: 'lic', children: [{ text: 'Premier' }] }] },
                { type: 'li', children: [{ type: 'lic', children: [{ text: 'Deuxième' }] }] },
              ],
            },
          ]}
        />,
      );
      expect(screen.getByText('1.')).toBeTruthy();
      expect(screen.getByText('2.')).toBeTruthy();
    });
  });

  describe('blockquote', () => {
    it('renders content', () => {
      render(<PlateRenderer content={[{ type: 'blockquote', children: [p('Citation célèbre')] }]} />);
      expect(screen.getByText('Citation célèbre')).toBeTruthy();
    });
  });

  describe('link', () => {
    it('renders link text', () => {
      render(
        <PlateRenderer
          content={[
            { type: 'p', children: [{ type: 'a', url: 'https://example.com', children: [{ text: 'Cliquez ici' }] }] },
          ]}
        />,
      );
      expect(screen.getByText('Cliquez ici')).toBeTruthy();
    });
  });

  describe('table', () => {
    it('renders header and cell content', () => {
      render(
        <PlateRenderer
          content={[
            {
              type: 'table',
              children: [
                {
                  type: 'tr',
                  children: [
                    { type: 'th', children: [{ type: 'p', children: [{ text: 'En-tête' }] }] },
                    { type: 'td', children: [{ type: 'p', children: [{ text: 'Cellule' }] }] },
                  ],
                },
              ],
            },
          ]}
        />,
      );
      expect(screen.getByText('En-tête')).toBeTruthy();
      expect(screen.getByText('Cellule')).toBeTruthy();
    });
  });

  describe('unknown block type', () => {
    it('skips silently without crash', () => {
      expect(() => render(<PlateRenderer content={[{ type: 'unknown-xyz', children: [] }]} />)).not.toThrow();
    });
  });
});
