'use client';

import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import { BoldPlugin, ItalicPlugin, StrikethroughPlugin, UnderlinePlugin } from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ListPlugin } from '@udecode/plate-list/react';
import { ImagePlugin } from '@udecode/plate-media/react';
import { TablePlugin } from '@udecode/plate-table/react';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
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

type EditorContent = Record<string, unknown>;

type PlateEditorProps = {
  value?: EditorContent;
  onChange?: (value: EditorContent) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );
}

export function PlateEditor({ value, onChange, readOnly = false, placeholder, className }: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      HeadingPlugin,
      BlockquotePlugin,
      CodeBlockPlugin,
      ListPlugin,
      LinkPlugin,
      ImagePlugin,
      TablePlugin,
    ],
  });

  const handleChange = ({ value: newValue }: { value: unknown[] }) => {
    if (onChange) {
      onChange({ type: 'doc', content: newValue });
    }
  };

  const toggleMark = (type: string) => {
    editor.tf.toggleMark({ type });
  };

  const toggleBlock = (type: string) => {
    editor.tf.toggleBlock({ type });
  };

  return (
    <div className={cn('overflow-hidden rounded-md border', className)}>
      <Plate editor={editor} onChange={handleChange} readOnly={readOnly}>
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1">
            <ToolbarButton onClick={() => toggleMark(BoldPlugin.key)} title="Gras">
              <Bold className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => toggleMark(ItalicPlugin.key)} title="Italique">
              <Italic className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => toggleMark(UnderlinePlugin.key)} title="Souligné">
              <Underline className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => toggleMark(StrikethroughPlugin.key)} title="Barré">
              <Strikethrough className="size-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton onClick={() => toggleBlock('h1')} title="Titre 1">
              <Heading1 className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => toggleBlock('h2')} title="Titre 2">
              <Heading2 className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => toggleBlock('h3')} title="Titre 3">
              <Heading3 className="size-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton onClick={() => toggleBlock(BlockquotePlugin.key)} title="Citation">
              <Quote className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => toggleBlock(CodeBlockPlugin.key)} title="Bloc de code">
              <Code className="size-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton onClick={() => toggleBlock(ListPlugin.key)} title="Liste à puces">
              <List className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => toggleBlock('ol')} title="Liste numérotée">
              <ListOrdered className="size-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton
              onClick={() => {
                const url = window.prompt('URL du lien :');
                if (url) {
                  editor.tf.insertLink({ url, text: url });
                }
              }}
              title="Insérer un lien"
            >
              <Link className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt("URL de l'image :");
                if (url) {
                  editor.tf.insertNodes({ type: ImagePlugin.key, url, children: [{ text: '' }] });
                }
              }}
              title="Insérer une image"
            >
              <Image className="size-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <ToolbarButton
              onClick={() => {
                editor.tf.insertTable({ rowCount: 3, colCount: 3 });
              }}
              title="Insérer un tableau"
            >
              <Table className="size-4" />
            </ToolbarButton>
          </div>
        )}

        <PlateContent
          className={cn('min-h-[200px] px-4 py-3 text-sm focus:outline-none', readOnly && 'cursor-default')}
          placeholder={placeholder ?? 'Commencez à écrire…'}
          readOnly={readOnly}
          disableDefaultStyles
        />
      </Plate>
    </div>
  );
}
