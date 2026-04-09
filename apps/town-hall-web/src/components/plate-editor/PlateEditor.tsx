'use client';

import type { PlateElementProps, PlateLeafProps } from '@udecode/plate/react';
import {
  Plate,
  PlateContent,
  useEditorState,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
  usePlateEditor,
} from '@udecode/plate/react';
import { BoldPlugin, ItalicPlugin, StrikethroughPlugin, UnderlinePlugin } from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { insertLink } from '@udecode/plate-link';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ListPlugin, useListToolbarButton, useListToolbarButtonState } from '@udecode/plate-list/react';
import { ImagePlugin } from '@udecode/plate-media/react';
import { insertTable } from '@udecode/plate-table';
import { TablePlugin } from '@udecode/plate-table/react';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Table,
  Underline,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type EditorValue = Record<string, unknown>;

type PlateEditorProps = {
  value?: EditorValue;
  onChange?: (value: EditorValue) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
};

// --- Leaf components (inline marks) ---

function BoldLeaf({ attributes, children }: PlateLeafProps) {
  return <strong {...attributes}>{children}</strong>;
}

function ItalicLeaf({ attributes, children }: PlateLeafProps) {
  return <em {...attributes}>{children}</em>;
}

function UnderlineLeaf({ attributes, children }: PlateLeafProps) {
  return (
    <u {...attributes} className="underline">
      {children}
    </u>
  );
}

function StrikethroughLeaf({ attributes, children }: PlateLeafProps) {
  return (
    <s {...attributes} className="line-through">
      {children}
    </s>
  );
}

// --- Block element components ---

function H1Element({ attributes, children }: PlateElementProps) {
  return (
    <h1 {...attributes} className="mb-2 mt-6 scroll-m-20 text-2xl font-bold tracking-tight">
      {children}
    </h1>
  );
}

function H2Element({ attributes, children }: PlateElementProps) {
  return (
    <h2 {...attributes} className="mb-1.5 mt-5 scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function H3Element({ attributes, children }: PlateElementProps) {
  return (
    <h3 {...attributes} className="mb-1 mt-4 scroll-m-20 text-lg font-medium tracking-tight">
      {children}
    </h3>
  );
}

function BlockquoteElementComp({ attributes, children }: PlateElementProps) {
  return (
    <blockquote {...attributes} className="my-3 border-l-2 border-border pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  );
}

function UlElement({ attributes, children }: PlateElementProps) {
  return (
    <ul {...attributes} className="my-2 ml-6 list-disc">
      {children}
    </ul>
  );
}

function OlElement({ attributes, children }: PlateElementProps) {
  return (
    <ol {...attributes} className="my-2 ml-6 list-decimal">
      {children}
    </ol>
  );
}

function LiElement({ attributes, children }: PlateElementProps) {
  return (
    <li {...attributes} className="my-0.5">
      {children}
    </li>
  );
}

function LicElement({ attributes, children }: PlateElementProps) {
  return <div {...attributes}>{children}</div>;
}

function LinkElement({ attributes, children, element }: PlateElementProps) {
  const url = (element as { url?: string }).url ?? '#';
  return (
    <a
      {...attributes}
      href={url}
      rel="noopener noreferrer"
      className="cursor-pointer text-primary underline decoration-primary underline-offset-4"
    >
      {children}
    </a>
  );
}

function ImageElement({ attributes, children, element }: PlateElementProps) {
  const url = (element as { url?: string }).url ?? '';
  const alt = (element as { alt?: string }).alt ?? '';
  return (
    <div {...attributes} className="my-4 flex justify-center">
      <img src={url} alt={alt} className="max-w-full rounded-md" />
      {children}
    </div>
  );
}

function TableElementComp({ attributes, children }: PlateElementProps) {
  return (
    <div className="my-4 overflow-x-auto">
      <table {...attributes} className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

function TableRowElement({ attributes, children }: PlateElementProps) {
  return (
    <tr {...attributes} className="border-b border-border">
      {children}
    </tr>
  );
}

function TableCellElement({ attributes, children }: PlateElementProps) {
  return (
    <td {...attributes} className="border border-border p-2">
      {children}
    </td>
  );
}

function TableHeaderCellElement({ attributes, children }: PlateElementProps) {
  return (
    <th {...attributes} className="border border-border bg-muted/50 p-2 font-medium">
      {children}
    </th>
  );
}

// --- Toolbar button sub-components (must be inside <Plate> context) ---

type MarkButtonProps = {
  nodeType: string;
  title: string;
  children: React.ReactNode;
};

function MarkButton({ nodeType, title, children }: MarkButtonProps) {
  const state = useMarkToolbarButtonState({ nodeType });
  const { props: buttonProps } = useMarkToolbarButton(state);
  return (
    <Button
      type="button"
      variant={state.pressed ? 'secondary' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      {...buttonProps}
      title={title}
    >
      {children}
    </Button>
  );
}

type ListButtonProps = {
  nodeType?: string;
  title: string;
  children: React.ReactNode;
};

function ListButton({ nodeType, title, children }: ListButtonProps) {
  const state = useListToolbarButtonState({ nodeType });
  const { props: buttonProps } = useListToolbarButton(state);
  return (
    <Button
      type="button"
      variant={state.pressed ? 'secondary' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      {...buttonProps}
      title={title}
    >
      {children}
    </Button>
  );
}

type BlockButtonProps = {
  type: string;
  title: string;
  children: React.ReactNode;
};

function BlockButton({ type, title, children }: BlockButtonProps) {
  const editor = useEditorState();
  const isActive = editor.api.some({ match: { type } });
  return (
    <Button
      type="button"
      variant={isActive ? 'secondary' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      onMouseDown={(e) => {
        e.preventDefault();
        editor.tf.toggleBlock(type);
      }}
      title={title}
    >
      {children}
    </Button>
  );
}

// --- Toolbar (must be rendered inside <Plate> provider) ---

function EditorToolbar() {
  const editor = useEditorState();

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1">
      <MarkButton nodeType={BoldPlugin.key} title="Gras">
        <Bold className="size-4" />
      </MarkButton>
      <MarkButton nodeType={ItalicPlugin.key} title="Italique">
        <Italic className="size-4" />
      </MarkButton>
      <MarkButton nodeType={UnderlinePlugin.key} title="Souligné">
        <Underline className="size-4" />
      </MarkButton>
      <MarkButton nodeType={StrikethroughPlugin.key} title="Barré">
        <Strikethrough className="size-4" />
      </MarkButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <BlockButton type="h1" title="Titre 1">
        <Heading1 className="size-4" />
      </BlockButton>
      <BlockButton type="h2" title="Titre 2">
        <Heading2 className="size-4" />
      </BlockButton>
      <BlockButton type="h3" title="Titre 3">
        <Heading3 className="size-4" />
      </BlockButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <BlockButton type={BlockquotePlugin.key} title="Citation">
        <Quote className="size-4" />
      </BlockButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ListButton nodeType="ul" title="Liste à puces">
        <List className="size-4" />
      </ListButton>
      <ListButton nodeType="ol" title="Liste numérotée">
        <ListOrdered className="size-4" />
      </ListButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onMouseDown={(e) => {
          e.preventDefault();
          const url = window.prompt('URL du lien :');
          if (url) {
            insertLink(editor, { url, text: url });
          }
        }}
        title="Insérer un lien"
      >
        <Link2 className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onMouseDown={(e) => {
          e.preventDefault();
          const url = window.prompt("URL de l'image :");
          if (url) {
            editor.tf.insertNodes({ type: ImagePlugin.key, url, children: [{ text: '' }] });
          }
        }}
        title="Insérer une image"
      >
        <Image className="size-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onMouseDown={(e) => {
          e.preventDefault();
          insertTable(editor, { rowCount: 3, colCount: 3 });
        }}
        title="Insérer un tableau"
      >
        <Table className="size-4" />
      </Button>
    </div>
  );
}

// --- Component override map ---

const EDITOR_COMPONENTS = {
  [BoldPlugin.key]: BoldLeaf,
  [ItalicPlugin.key]: ItalicLeaf,
  [UnderlinePlugin.key]: UnderlineLeaf,
  [StrikethroughPlugin.key]: StrikethroughLeaf,
  h1: H1Element,
  h2: H2Element,
  h3: H3Element,
  [BlockquotePlugin.key]: BlockquoteElementComp,
  ul: UlElement,
  ol: OlElement,
  li: LiElement,
  lic: LicElement,
  [LinkPlugin.key]: LinkElement,
  [ImagePlugin.key]: ImageElement,
  table: TableElementComp,
  tr: TableRowElement,
  td: TableCellElement,
  th: TableHeaderCellElement,
};

// --- Main editor component ---

export function PlateEditor({ onChange, readOnly = false, placeholder, className }: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      HeadingPlugin,
      BlockquotePlugin,
      ListPlugin,
      LinkPlugin,
      ImagePlugin,
      TablePlugin,
    ],
    override: {
      components: EDITOR_COMPONENTS,
    },
  });

  const handleChange = ({ value }: { value: unknown[] }) => {
    onChange?.({ type: 'doc', content: value });
  };

  return (
    <div className={cn('overflow-hidden rounded-md border', className)}>
      <Plate editor={editor} onChange={handleChange} readOnly={readOnly}>
        {!readOnly && <EditorToolbar />}
        <PlateContent
          className="min-h-[200px] px-4 py-3 text-sm focus:outline-none"
          placeholder={placeholder ?? 'Commencez à écrire…'}
          readOnly={readOnly}
          disableDefaultStyles
        />
      </Plate>
    </div>
  );
}
