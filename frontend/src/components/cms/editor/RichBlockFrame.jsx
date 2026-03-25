import { NodeViewWrapper } from '@tiptap/react';
import { getRichBlockWrapperStyle } from './blockAlignment';

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

export default function RichBlockFrame({
  alignment,
  selected = false,
  onRemove,
  removeLabel = 'Eliminar bloque',
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionPressed = false,
  renderSecondaryIcon,
  wrapperClassName = 'my-4',
  frameClassName = '',
  frameStyle,
  dragHandle = false,
  children,
}) {
  return (
    <NodeViewWrapper
      className={wrapperClassName}
      style={getRichBlockWrapperStyle(alignment)}
      data-drag-handle={dragHandle ? '' : undefined}
    >
      <div className={joinClassNames('group/rich-block relative max-w-full', frameClassName)} style={frameStyle}>
        {onSecondaryAction && secondaryActionLabel && renderSecondaryIcon ? (
          <button
            type="button"
            aria-label={secondaryActionLabel}
            title={secondaryActionLabel}
            aria-pressed={secondaryActionPressed}
            contentEditable={false}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSecondaryAction();
            }}
            className={joinClassNames(
              'absolute right-14 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/72 text-white shadow-lg backdrop-blur-sm transition-all',
              selected
                ? 'opacity-100 scale-100'
                : 'pointer-events-none opacity-0 scale-95 group-hover/rich-block:pointer-events-auto group-hover/rich-block:opacity-100 group-hover/rich-block:scale-100 group-focus-within/rich-block:pointer-events-auto group-focus-within/rich-block:opacity-100 group-focus-within/rich-block:scale-100'
            )}
            data-rich-block-secondary-action=""
          >
            {renderSecondaryIcon()}
          </button>
        ) : null}
        <button
          type="button"
          aria-label={removeLabel}
          title={removeLabel}
          contentEditable={false}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove?.();
          }}
          className={joinClassNames(
            'absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/72 text-white shadow-lg backdrop-blur-sm transition-all',
            selected
              ? 'opacity-100 scale-100'
              : 'pointer-events-none opacity-0 scale-95 group-hover/rich-block:pointer-events-auto group-hover/rich-block:opacity-100 group-hover/rich-block:scale-100 group-focus-within/rich-block:pointer-events-auto group-focus-within/rich-block:opacity-100 group-focus-within/rich-block:scale-100'
          )}
          data-rich-block-remove=""
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        {children}
      </div>
    </NodeViewWrapper>
  );
}
