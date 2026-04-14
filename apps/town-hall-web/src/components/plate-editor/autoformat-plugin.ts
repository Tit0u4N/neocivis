import type { AutoformatRule } from '@platejs/autoformat';

import {
  AutoformatPlugin,
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatPunctuation,
  autoformatSmartQuotes,
} from '@platejs/autoformat';
import { toggleBulletedList, toggleNumberedList } from '@platejs/list-classic';
import { KEYS } from 'platejs';

// Marks disponibles dans l'éditeur : bold, italic, underline, strikethrough
const autoformatMarks: AutoformatRule[] = [
  { match: '***', mode: 'mark', type: [KEYS.bold, KEYS.italic] },
  { match: '__*', mode: 'mark', type: [KEYS.underline, KEYS.italic] },
  { match: '__**', mode: 'mark', type: [KEYS.underline, KEYS.bold] },
  { match: '___***', mode: 'mark', type: [KEYS.underline, KEYS.bold, KEYS.italic] },
  { match: '**', mode: 'mark', type: KEYS.bold },
  { match: '__', mode: 'mark', type: KEYS.underline },
  { match: '*', mode: 'mark', type: KEYS.italic },
  { match: '_', mode: 'mark', type: KEYS.italic },
  { match: '~~', mode: 'mark', type: KEYS.strikethrough },
];

// Blocs disponibles : h1-h3, blockquote
const autoformatBlocks: AutoformatRule[] = [
  { match: '# ', mode: 'block', type: KEYS.h1 },
  { match: '## ', mode: 'block', type: KEYS.h2 },
  { match: '### ', mode: 'block', type: KEYS.h3 },
  { match: '> ', mode: 'block', type: KEYS.blockquote },
];

// Listes classiques (list-classic)
const autoformatLists: AutoformatRule[] = [
  {
    match: ['* ', '- '],
    mode: 'block',
    type: KEYS.ul,
    format: (editor) => {
      toggleBulletedList(editor);
    },
  },
  {
    match: [String.raw`^\d+\.$ `, String.raw`^\d+\)$ `],
    matchByRegex: true,
    mode: 'block',
    type: KEYS.ol,
    format: (editor) => {
      toggleNumberedList(editor);
    },
  },
];

export const autoformatPlugin = AutoformatPlugin.configure({
  options: {
    enableUndoOnDelete: true,
    rules: [
      ...autoformatBlocks,
      ...autoformatMarks,
      ...autoformatSmartQuotes,
      ...autoformatPunctuation,
      ...autoformatLegal,
      ...autoformatLegalHtml,
      ...autoformatArrow,
      ...autoformatMath,
      ...autoformatLists,
    ],
  },
});
