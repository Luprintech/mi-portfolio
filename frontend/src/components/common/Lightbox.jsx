import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Lightbox({ images, currentIndex, onClose }) {
  const [index, setIndex] = useState(currentIndex);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIndex(currentIndex);
    setIsLoading(true);
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsLoading(true);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsLoading(true);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') handlePrevious();
      if (event.key === 'ArrowRight') handleNext();
    },
    [onClose, handlePrevious, handleNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!images || images.length === 0 || index < 0 || index >= images.length) {
    return null;
  }

  const currentImage = images[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
        aria-label="Cerrar lightbox"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
            aria-label="Imagen anterior"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
            aria-label="Imagen siguiente"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          </div>
        )}

        <img
          src={currentImage.src}
          alt={currentImage.alt || ''}
          className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
          onLoad={() => setIsLoading(false)}
        />

        {(currentImage.caption || currentImage.alt) && (
          <div className="mt-4 max-w-2xl rounded-xl bg-white/10 px-6 py-3 text-center text-sm leading-6 text-white backdrop-blur-md">
            {currentImage.caption || currentImage.alt}
          </div>
        )}

        {images.length > 1 && (
          <div className="mt-3 text-center text-sm text-white/70">
            {index + 1} / {images.length}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
