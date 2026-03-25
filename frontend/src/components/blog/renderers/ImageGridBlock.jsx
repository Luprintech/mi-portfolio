import { resolveContentLinkAttributes } from '../../../lib/contentLinkUtils';
import {
  getImageGridAspectClass,
  getImageGridColumnsClass,
  getImageGridCornerClass,
  getImageGridGapClass,
  getImageGridImageFitClass,
  getImageGridItemAspectClass,
  getImageGridItemSizeLabel,
  getImageGridItemSpanClass,
  getImageGridWidthClass,
  normalizeImageGridConfig,
  parseImageGridPayload,
  shouldRenderImageGridCaption,
} from './imageGridPayload';

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

export default function ImageGridBlock({ images = [], columns = 2, config = null }) {
  const items = parseImageGridPayload(images);
  const gridConfig = normalizeImageGridConfig({ columns, ...(config || {}) });

  if (!items.length) return null;

  return (
    <section
      className={joinClassNames('my-10', getImageGridWidthClass(gridConfig.width))}
      data-rendered-block="image-grid"
      data-image-grid-layout={gridConfig.layoutStyle}
      data-image-grid-width={gridConfig.width}
      data-image-grid-caption-mode={gridConfig.captionMode}
    >
      <div className={joinClassNames('grid', getImageGridGapClass(gridConfig.gap), getImageGridColumnsClass(gridConfig))}>
        {items.map((image, index) => (
          <figure
            key={`${image.src}-${index}`}
            className={joinClassNames(
              'group relative overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface)]/85 shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
              getImageGridItemSpanClass(image, gridConfig),
              getImageGridCornerClass(gridConfig.cornerStyle)
            )}
            data-image-grid-item-size={image.size || 'standard'}
          >
            {image.href ? (
              <a
                {...resolveContentLinkAttributes({
                  href: image.href,
                  target: image.openInNewTab ? '_blank' : '_self',
                  rel: image.openInNewTab ? 'noopener noreferrer' : '',
                })}
                className="block"
              >
                <img
                  src={image.src}
                  alt={image.alt || ''}
                  loading="lazy"
                  className={joinClassNames(
                    'w-full bg-[var(--bg-surface)]',
                    getImageGridItemAspectClass(image, gridConfig) || getImageGridAspectClass(gridConfig.aspectRatio),
                    getImageGridImageFitClass(gridConfig.imageFit)
                  )}
                />
              </a>
            ) : (
              <img
                src={image.src}
                alt={image.alt || ''}
                loading="lazy"
                className={joinClassNames(
                  'w-full bg-[var(--bg-surface)]',
                  getImageGridItemAspectClass(image, gridConfig) || getImageGridAspectClass(gridConfig.aspectRatio),
                  getImageGridImageFitClass(gridConfig.imageFit)
                )}
              />
            )}
            {gridConfig.layoutStyle === 'mosaic' && image.size !== 'standard' ? (
              <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/15 bg-slate-950/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100 backdrop-blur">
                {getImageGridItemSizeLabel(image.size)}
              </span>
            ) : null}
            {gridConfig.captionMode === 'overlay' && shouldRenderImageGridCaption(gridConfig.captionMode, image) ? (
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent px-4 pb-4 pt-10 text-sm leading-6 text-white">
                {image.caption || image.alt}
              </figcaption>
            ) : null}
            {gridConfig.captionMode === 'below' && shouldRenderImageGridCaption(gridConfig.captionMode, image) ? (
              <figcaption className="border-t border-[var(--border-default)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
                {image.caption || image.alt}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
