import { useState, useMemo } from 'react';
import { resolveContentLinkAttributes } from '../../../lib/contentLinkUtils';
import {
  collectImageGridTags,
  filterImageGridItems,
  getImageGridAspectClass,
  getImageGridColumnsClass,
  getImageGridCornerClass,
  getImageGridGapClass,
  getImageGridHoverEffectClass,
  getImageGridImageFitClass,
  getImageGridItemAspectClass,
  getImageGridItemSizeLabel,
  getImageGridItemSpanClass,
  getImageGridLoadingStrategy,
  getImageGridWidthClass,
  normalizeImageGridConfig,
  parseImageGridPayload,
  shouldRenderImageGridCaption,
} from './imageGridPayload';
import Lightbox from '../../common/Lightbox';

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

export default function ImageGridBlock({ images = [], columns = 2, config = null }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  
  const allItems = parseImageGridPayload(images);
  const gridConfig = normalizeImageGridConfig({ columns, ...(config || {}) });
  
  const availableTags = useMemo(() => collectImageGridTags(allItems), [allItems]);
  const filteredItems = useMemo(() => filterImageGridItems(allItems, activeFilters), [allItems, activeFilters]);

  if (!allItems.length) return null;
  
  const showFilters = availableTags.length > 0;
  const items = showFilters ? filteredItems : allItems;
  const loadingStrategy = getImageGridLoadingStrategy(gridConfig.loadingMode);
  
  const handleImageClick = (index) => {
    if (gridConfig.enableLightbox) {
      setLightboxIndex(index);
    }
  };
  
  const toggleFilter = (tag) => {
    setActiveFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <section
      className={joinClassNames('my-10', getImageGridWidthClass(gridConfig.width))}
      data-rendered-block="image-grid"
      data-image-grid-layout={gridConfig.layoutStyle}
      data-image-grid-width={gridConfig.width}
      data-image-grid-caption-mode={gridConfig.captionMode}
      data-image-grid-hover={gridConfig.hoverEffect}
    >
      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Filtrar:</span>
          {availableTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleFilter(tag)}
              className={joinClassNames(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                activeFilters.includes(tag)
                  ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)]/50 text-[var(--text-muted)] hover:border-fuchsia-500/50'
              )}
            >
              {tag}
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilters([])}
              className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 transition-all hover:bg-red-500/20"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)]/50 px-6 py-12 text-center text-sm text-[var(--text-muted)]">
          No hay imágenes que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className={joinClassNames('grid', getImageGridGapClass(gridConfig.gap), getImageGridColumnsClass(gridConfig))}>
          {items.map((image, index) => {
            const hasClickableLightbox = gridConfig.enableLightbox && !image.href;
            const ImageWrapper = image.href && !gridConfig.enableLightbox ? 'a' : 'div';
            const wrapperProps = image.href && !gridConfig.enableLightbox
              ? resolveContentLinkAttributes({
                  href: image.href,
                  target: image.openInNewTab ? '_blank' : '_self',
                  rel: image.openInNewTab ? 'noopener noreferrer' : '',
                })
              : {};

            return (
              <figure
                key={`${image.src}-${index}`}
                className={joinClassNames(
                  'group relative overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface)]/85 shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
                  getImageGridItemSpanClass(image, gridConfig),
                  getImageGridCornerClass(gridConfig.cornerStyle),
                  getImageGridHoverEffectClass(gridConfig.hoverEffect),
                  hasClickableLightbox ? 'cursor-pointer' : ''
                )}
                data-image-grid-item-size={image.size || 'standard'}
                onClick={hasClickableLightbox ? () => handleImageClick(index) : undefined}
              >
                <ImageWrapper {...wrapperProps} className={image.href && !gridConfig.enableLightbox ? 'block' : 'block relative'}>
                  <img
                    src={image.src}
                    alt={image.alt || ''}
                    {...loadingStrategy}
                    className={joinClassNames(
                      'w-full bg-[var(--bg-surface)]',
                      getImageGridItemAspectClass(image, gridConfig) || getImageGridAspectClass(gridConfig.aspectRatio),
                      getImageGridImageFitClass(gridConfig.imageFit),
                      gridConfig.hoverEffect === 'zoom' ? 'transition-transform duration-300 group-hover:scale-110' : ''
                    )}
                  />
                  {gridConfig.hoverEffect === 'overlay' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  )}
                </ImageWrapper>

                {gridConfig.layoutStyle === 'mosaic' && image.size !== 'standard' && (
                  <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/15 bg-slate-950/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100 backdrop-blur">
                    {getImageGridItemSizeLabel(image.size)}
                  </span>
                )}

                {hasClickableLightbox && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                )}

                {gridConfig.captionMode === 'overlay' && shouldRenderImageGridCaption(gridConfig.captionMode, image) && (
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent px-4 pb-4 pt-10 text-sm leading-6 text-white">
                    {image.caption || image.alt}
                  </figcaption>
                )}

                {gridConfig.captionMode === 'below' && shouldRenderImageGridCaption(gridConfig.captionMode, image) && (
                  <figcaption className="border-t border-[var(--border-default)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
                    {image.caption || image.alt}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={items}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
