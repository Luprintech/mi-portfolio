import { parseImageGridPayload } from './imageGridPayload';

function getColumnsClass(columns) {
  if (columns >= 4) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
  if (columns >= 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-1 sm:grid-cols-2';
}

export default function ImageGridBlock({ images = [], columns = 2 }) {
  const items = parseImageGridPayload(images);

  if (!items.length) return null;

  return (
    <section className="my-10" data-rendered-block="image-grid">
      <div className={`grid gap-4 ${getColumnsClass(columns)}`}>
        {items.map((image, index) => (
          <figure
            key={`${image.src}-${index}`}
            className="overflow-hidden rounded-[1.35rem] border border-[var(--border-default)] bg-[var(--bg-surface)]/85 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
          >
            <img
              src={image.src}
              alt={image.alt || ''}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            {(image.caption || image.alt) && (
              <figcaption className="border-t border-[var(--border-default)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
                {image.caption || image.alt}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
