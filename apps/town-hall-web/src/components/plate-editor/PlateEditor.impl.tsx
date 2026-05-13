'use client';

import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { DndPlugin } from '@platejs/dnd';
import { LinkPlugin } from '@platejs/link/react';
import { toggleBulletedList, toggleNumberedList } from '@platejs/list-classic';
import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
} from '@platejs/list-classic/react';
import { ImagePlugin } from '@platejs/media/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { TableCellHeaderPlugin, TableCellPlugin, TablePlugin, TableRowPlugin } from '@platejs/table/react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
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
import { KEYS } from 'platejs';
import { Plate, PlateElement, type PlateElementProps, usePlateEditor } from 'platejs/react';
import { useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MediaGallery } from '@/components/media-gallery/MediaGallery';

import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';
import { ToolbarButton, ToolbarGroup } from '@/components/ui/toolbar';
import { cn } from '@/lib/utils';
import { autoformatPlugin } from './autoformat-plugin';
import { BlockContextMenu } from './BlockContextMenu';
import { BlockDraggable } from './BlockDraggable';

// --- Element components ---

function H1Element(props: PlateElementProps) {
  return <PlateElement as="h1" className="mt-[1.4em] mb-1 font-bold text-3xl tracking-tight" {...props} />;
}

function H2Element(props: PlateElementProps) {
  return <PlateElement as="h2" className="mt-[1.2em] mb-1 font-semibold text-2xl tracking-tight" {...props} />;
}

function H3Element(props: PlateElementProps) {
  return <PlateElement as="h3" className="mt-[1em] mb-1 font-semibold text-xl tracking-tight" {...props} />;
}

function BlockquoteElement(props: PlateElementProps) {
  return <PlateElement as="blockquote" className="my-1 border-l-2 pl-6 italic" {...props} />;
}

function BulletedListElement(props: PlateElementProps) {
  return <PlateElement as="ul" className="my-2 ml-6 list-disc" {...props} />;
}

function NumberedListElement(props: PlateElementProps) {
  return <PlateElement as="ol" className="my-2 ml-6 list-decimal" {...props} />;
}

function ListItemElement(props: PlateElementProps) {
  return <PlateElement as="li" className="my-0.5" {...props} />;
}

function ListItemContentElement(props: PlateElementProps) {
  return <PlateElement {...props} />;
}

function LinkElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="a"
      className="cursor-pointer text-primary underline decoration-primary underline-offset-4"
      {...props}
    />
  );
}

function ImageElement(props: PlateElementProps) {
  const url = (props.element as { url?: string }).url ?? '';
  const alt = (props.element as { alt?: string }).alt ?? '';
  return (
    <PlateElement {...props}>
      <div className="my-4 flex justify-center">
        <img src={url} alt={alt} className="max-w-full rounded-md" />
      </div>
      {props.children}
    </PlateElement>
  );
}

function TableElement(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">{props.children}</table>
      </div>
    </PlateElement>
  );
}

function TableRowElement(props: PlateElementProps) {
  return <PlateElement as="tr" className="border-border border-b" {...props} />;
}

function TableCellElement(props: PlateElementProps) {
  return <PlateElement as="td" className="border border-border p-2" {...props} />;
}

function TableCellHeaderElement(props: PlateElementProps) {
  return <PlateElement as="th" className="border border-border bg-muted/50 p-2 font-medium" {...props} />;
}

// --- Main component ---

type PlateEditorProps = {
  value?: unknown[];
  onChange?: (value: unknown[]) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
};

export function PlateEditor({ value, onChange, readOnly = false, placeholder, className }: PlateEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pendingInsertRef = useRef<((url: string) => void) | null>(null);

  const editor = usePlateEditor({
    plugins: [
      // Marks
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      // Blocks
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
      // Lists (ListPlugin fournit les comportements : Enter, Backspace, normalisation)
      ListPlugin,
      BulletedListPlugin.withComponent(BulletedListElement),
      NumberedListPlugin.withComponent(NumberedListElement),
      ListItemPlugin.withComponent(ListItemElement),
      ListItemContentPlugin.withComponent(ListItemContentElement),
      // Link
      LinkPlugin.withComponent(LinkElement),
      // Media
      ImagePlugin.withComponent(ImageElement),
      // Table
      TablePlugin.withComponent(TableElement),
      TableRowPlugin.withComponent(TableRowElement),
      TableCellPlugin.withComponent(TableCellElement),
      TableCellHeaderPlugin.withComponent(TableCellHeaderElement),
      // Block selection (needed for DnD + context menu)
      BlockSelectionPlugin,
      // Autoformat (raccourcis Markdown)
      autoformatPlugin,
      // Drag & Drop
      DndPlugin.configure({
        options: { enableScroller: true },
        render: {
          aboveNodes: BlockDraggable,
          aboveSlate: ({ children }) => <DndProvider backend={HTML5Backend}>{children}</DndProvider>,
        },
      }),
    ],
    // biome-ignore lint/suspicious/noExplicitAny: platejs Value type
    value: (value as any) ?? [{ type: KEYS.p, children: [{ text: '' }] }],
  });

  return (
    <RadixTooltip.Provider>
      {isPickerOpen && (
        <MediaGallery
          mode="picker"
          onSelect={(media) => {
            pendingInsertRef.current?.(media.url);
            setIsPickerOpen(false);
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
      <Plate editor={editor} onChange={({ value: v }) => onChange?.(v as unknown[])} readOnly={readOnly}>
        <div className={cn('overflow-hidden rounded-md border bg-background', className)}>
          {!readOnly && (
            <FixedToolbar>
              <ToolbarGroup>
                <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Gras (⌘+B)">
                  <Bold />
                </MarkToolbarButton>
                <MarkToolbarButton nodeType={ItalicPlugin.key} tooltip="Italique (⌘+I)">
                  <Italic />
                </MarkToolbarButton>
                <MarkToolbarButton nodeType={UnderlinePlugin.key} tooltip="Souligné (⌘+U)">
                  <Underline />
                </MarkToolbarButton>
                <MarkToolbarButton nodeType={StrikethroughPlugin.key} tooltip="Barré">
                  <Strikethrough />
                </MarkToolbarButton>
              </ToolbarGroup>

              <ToolbarGroup>
                <ToolbarButton
                  tooltip="Titre 1"
                  onClick={() => editor.tf.toggleBlock(KEYS.h1)}
                  pressed={editor.api.some({ match: { type: KEYS.h1 } })}
                >
                  <Heading1 />
                </ToolbarButton>
                <ToolbarButton
                  tooltip="Titre 2"
                  onClick={() => editor.tf.toggleBlock(KEYS.h2)}
                  pressed={editor.api.some({ match: { type: KEYS.h2 } })}
                >
                  <Heading2 />
                </ToolbarButton>
                <ToolbarButton
                  tooltip="Titre 3"
                  onClick={() => editor.tf.toggleBlock(KEYS.h3)}
                  pressed={editor.api.some({ match: { type: KEYS.h3 } })}
                >
                  <Heading3 />
                </ToolbarButton>
                <ToolbarButton
                  tooltip="Citation"
                  onClick={() => editor.tf.toggleBlock(KEYS.blockquote)}
                  pressed={editor.api.some({ match: { type: KEYS.blockquote } })}
                >
                  <Quote />
                </ToolbarButton>
              </ToolbarGroup>

              <ToolbarGroup>
                <ToolbarButton
                  tooltip="Liste à puces"
                  onClick={() => toggleBulletedList(editor)}
                  pressed={editor.api.some({ match: { type: KEYS.ul } })}
                >
                  <List />
                </ToolbarButton>
                <ToolbarButton
                  tooltip="Liste numérotée"
                  onClick={() => toggleNumberedList(editor)}
                  pressed={editor.api.some({ match: { type: KEYS.ol } })}
                >
                  <ListOrdered />
                </ToolbarButton>
              </ToolbarGroup>

              <ToolbarGroup>
                <ToolbarButton
                  tooltip="Insérer un lien"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const url = window.prompt('URL du lien :');
                    if (url) {
                      editor.tf.insertNodes({
                        type: LinkPlugin.key,
                        url,
                        children: [{ text: url }],
                      });
                    }
                  }}
                >
                  <Link2 />
                </ToolbarButton>
                <ToolbarButton
                  tooltip="Insérer une image"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pendingInsertRef.current = (url: string) => {
                      editor.tf.insertNodes({ type: ImagePlugin.key, url, children: [{ text: '' }] });
                    };
                    setIsPickerOpen(true);
                  }}
                >
                  <Image />
                </ToolbarButton>
                <ToolbarButton
                  tooltip="Insérer un tableau"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.tf.insertNodes({
                      type: KEYS.table,
                      children: Array.from({ length: 3 }, () => ({
                        type: KEYS.tr,
                        children: Array.from({ length: 3 }, () => ({
                          type: KEYS.td,
                          children: [{ type: KEYS.p, children: [{ text: '' }] }],
                        })),
                      })),
                    });
                  }}
                >
                  <Table />
                </ToolbarButton>
              </ToolbarGroup>
            </FixedToolbar>
          )}

          <BlockContextMenu>
            <EditorContainer>
              <Editor placeholder={placeholder ?? 'Commencez à écrire…'} readOnly={readOnly} />
            </EditorContainer>
          </BlockContextMenu>
        </div>
      </Plate>
    </RadixTooltip.Provider>
  );
}
