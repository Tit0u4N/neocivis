'use client';

import { BlockSelectionPlugin } from '@platejs/selection/react';

import * as ContextMenu from '@radix-ui/react-context-menu';
import { Heading1, Heading2, Heading3, Quote, Trash2, Type } from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorRef } from 'platejs/react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const editor = useEditorRef();

  const handleDelete = () => {
    const selected = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes({ sort: true });
    if (selected.length > 0) {
      editor.tf.withoutNormalizing(() => {
        for (const [, path] of [...selected].reverse()) {
          editor.tf.removeNodes({ at: path });
        }
      });
    } else {
      editor.tf.removeNodes();
    }
  };

  const handleConvert = (type: string) => {
    const selected = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes({ sort: true });
    if (selected.length > 0) {
      editor.tf.withoutNormalizing(() => {
        for (const [, path] of selected) {
          editor.tf.setNodes({ type }, { at: path });
        }
      });
    } else {
      editor.tf.toggleBlock(type);
    }
    editor.getApi(BlockSelectionPlugin).blockSelection.set([]);
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className={cn(
            'z-50 min-w-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            'data-[state=closed]:animate-out data-[state=open]:animate-in',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
          onCloseAutoFocus={() => {
            editor.getApi(BlockSelectionPlugin).blockSelection.focus();
          }}
        >
          <ContextMenu.Label className="px-2 py-1.5 font-semibold text-muted-foreground text-xs">
            Bloc
          </ContextMenu.Label>

          <ContextMenu.Separator className="-mx-1 my-1 h-px bg-border" />

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className={menuItemClass}>
              <Type className="mr-2 size-4" />
              Transformer en...
              <span className="ml-auto">›</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className={cn(menuContentClass, 'min-w-32')}>
                <ContextMenu.Item className={menuItemClass} onSelect={() => handleConvert(KEYS.p)}>
                  <Type className="mr-2 size-4" />
                  Paragraphe
                </ContextMenu.Item>
                <ContextMenu.Item className={menuItemClass} onSelect={() => handleConvert(KEYS.h1)}>
                  <Heading1 className="mr-2 size-4" />
                  Titre 1
                </ContextMenu.Item>
                <ContextMenu.Item className={menuItemClass} onSelect={() => handleConvert(KEYS.h2)}>
                  <Heading2 className="mr-2 size-4" />
                  Titre 2
                </ContextMenu.Item>
                <ContextMenu.Item className={menuItemClass} onSelect={() => handleConvert(KEYS.h3)}>
                  <Heading3 className="mr-2 size-4" />
                  Titre 3
                </ContextMenu.Item>
                <ContextMenu.Item className={menuItemClass} onSelect={() => handleConvert(KEYS.blockquote)}>
                  <Quote className="mr-2 size-4" />
                  Citation
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Separator className="-mx-1 my-1 h-px bg-border" />

          <ContextMenu.Item
            className={cn(menuItemClass, 'text-destructive focus:text-destructive')}
            onSelect={handleDelete}
          >
            <Trash2 className="mr-2 size-4" />
            Supprimer
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

const menuItemClass =
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50';

const menuContentClass =
  'z-50 min-w-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95';
