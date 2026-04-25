/** biome-ignore-all lint/a11y/useSemanticElements: Editor */
'use client';

import { DndPlugin, useDraggable, useDropLine } from '@platejs/dnd';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { GripVertical } from 'lucide-react';
import { getPluginByType, isType, KEYS, type TElement } from 'platejs';
import {
  MemoizedChildren,
  type PlateEditor,
  type PlateElementProps,
  type RenderNodeWrapper,
  useEditorRef,
  useElement,
  usePluginOption,
  useSelected,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const UNDRAGGABLE_KEYS = [KEYS.column, KEYS.tr, KEYS.td];

export const BlockDraggable: RenderNodeWrapper = (props) => {
  const { editor, element, path } = props;

  const enabled = React.useMemo(() => {
    if (editor.dom.readOnly) {
      return false;
    }
    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true;
    }
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: { type: editor.getType(KEYS.column) },
      });
      if (block) {
        return true;
      }
    }
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: { type: editor.getType(KEYS.table) },
      });
      if (block) {
        return true;
      }
    }
    return false;
  }, [editor, element, path]);

  if (!enabled) {
    return;
  }

  return (props) => <Draggable {...props} />;
};

function Draggable(props: PlateElementProps) {
  const { children, editor, element } = props;
  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection;

  const { isAboutToDrag, isDragging, nodeRef, previewRef, handleRef } = useDraggable({
    element,
    onDropHandler: (_, { dragItem }) => {
      const id = (dragItem as { id: string[] | string }).id;
      if (blockSelectionApi) {
        blockSelectionApi.add(id);
      }
      resetPreview();
    },
  });

  const [dragButtonTop, setDragButtonTop] = React.useState(0);

  const resetPreview = () => {
    if (previewRef.current) {
      previewRef.current.replaceChildren();
      previewRef.current.classList.add('hidden');
    }
  };

  React.useEffect(() => {
    if (!isDragging) {
      resetPreview();
    }
  }, [isDragging, resetPreview]);

  React.useEffect(() => {
    if (isAboutToDrag) {
      previewRef.current?.classList.remove('opacity-0');
    }
  }, [isAboutToDrag, previewRef.current?.classList.remove]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: UI Block
    <div
      className={cn(
        'relative',
        isDragging && 'opacity-50',
        getPluginByType(editor, element.type)?.node.isContainer ? 'group/container' : 'group',
      )}
      onMouseEnter={() => {
        if (isDragging) {
          return;
        }
        setDragButtonTop(calcDragButtonTop(editor, element));
      }}
    >
      <Gutter>
        <div className="slate-blockToolbarWrapper flex h-[1.5em]">
          <div className="slate-blockToolbar pointer-events-auto relative mr-1 flex w-4.5 items-center">
            <Button
              ref={handleRef}
              variant="ghost"
              className="-left-0 absolute h-6 w-full p-0"
              style={{ top: `${dragButtonTop + 3}px` }}
              data-plate-prevent-deselect
            >
              <DragHandle isDragging={isDragging} previewRef={previewRef} resetPreview={resetPreview} />
            </Button>
          </div>
        </div>
      </Gutter>

      <div ref={previewRef} className={cn('-left-0 absolute hidden w-full')} contentEditable={false} />

      {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
      <div
        ref={nodeRef}
        className="slate-blockWrapper flow-root"
        onContextMenu={(event) =>
          editor.getApi(BlockSelectionPlugin).blockSelection.addOnContextMenu({ element, event })
        }
      >
        <MemoizedChildren>{children}</MemoizedChildren>
        <DropLine />
      </div>
    </div>
  );
}

function Gutter({ children, className, ...props }: React.ComponentProps<'div'>) {
  const editor = useEditorRef();
  const element = useElement();
  const isSelectionAreaVisible = usePluginOption(BlockSelectionPlugin, 'isSelectionAreaVisible');
  const selected = useSelected();

  return (
    <div
      {...props}
      className={cn(
        'slate-gutterLeft',
        '-translate-x-full absolute top-0 z-50 flex h-full cursor-text hover:opacity-100 sm:opacity-0',
        getPluginByType(editor, element.type)?.node.isContainer
          ? 'group-hover/container:opacity-100'
          : 'group-hover:opacity-100',
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        className,
      )}
      contentEditable={false}
    >
      {children}
    </div>
  );
}

const DragHandle = React.memo(function DragHandle({
  isDragging,
  previewRef,
  resetPreview,
}: {
  isDragging: boolean;
  previewRef: React.RefObject<HTMLDivElement | null>;
  resetPreview: () => void;
}) {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        {/** biome-ignore lint/a11y/useFocusableInteractive: UI Block */}
        <div
          className="flex size-full items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            editor.getApi(BlockSelectionPlugin).blockSelection.focus();
          }}
          onMouseDown={(e) => {
            resetPreview();
            if ((e.button !== 0 && e.button !== 2) || e.shiftKey) {
              return;
            }
            const blockSelection = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes({ sort: true });
            const selectionNodes = blockSelection.length > 0 ? blockSelection : editor.api.blocks({ mode: 'highest' });

            if (!selectionNodes.some(([node]) => node.id === element.id)) {
              const blocks = [[element, editor.api.findPath(element)!]] as typeof selectionNodes;
              editor.getApi(BlockSelectionPlugin).blockSelection.set(blocks.map(([b]) => b.id as string));
              return;
            }

            editor.setOption(DndPlugin, 'multiplePreviewRef', previewRef);
            editor.getApi(BlockSelectionPlugin).blockSelection.set(selectionNodes.map(([b]) => b.id as string));
          }}
          onMouseUp={() => {
            resetPreview();
          }}
          data-plate-prevent-deselect
          role="button"
        >
          <GripVertical className="text-muted-foreground" />
        </div>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={4}
          className="z-50 rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs"
        >
          {isDragging ? 'Déplacer' : 'Glisser pour déplacer'}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
});

const DropLine = React.memo(function DropLine({ className, ...props }: React.ComponentProps<'div'>) {
  const { dropLine } = useDropLine();

  if (!dropLine) {
    return null;
  }

  return (
    <div
      {...props}
      className={cn(
        'slate-dropLine',
        'absolute inset-x-0 h-0.5 opacity-100 transition-opacity',
        'bg-brand/50',
        dropLine === 'top' && '-top-px',
        dropLine === 'bottom' && '-bottom-px',
        className,
      )}
    />
  );
});

const calcDragButtonTop = (editor: PlateEditor, element: TElement): number => {
  const child = editor.api.toDOMNode(element)!;
  const currentMarginTop = Number(window.getComputedStyle(child).marginTop.replace('px', ''));
  return currentMarginTop;
};
