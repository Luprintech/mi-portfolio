import { useState } from 'react';
import {
  getVideoEmbedUrl,
  getVideoGalleryAspectClass,
  getVideoGalleryColumnsClass,
  normalizeVideoGalleryConfig,
  normalizeVideoGalleryItems,
} from '../../../lib/videoGallery';

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

export default function VideoGalleryBlock({ videos = [], config = null }) {
  const [activeVideo, setActiveVideo] = useState(null);
  const items = normalizeVideoGalleryItems(videos);
  const galleryConfig = normalizeVideoGalleryConfig(config || {});

  if (!items.length) return null;

  const handlePlayVideo = (item) => {
    setActiveVideo(item);
  };

  const handleCloseModal = () => {
    setActiveVideo(null);
  };

  return (
    <section className="my-10 w-full" data-rendered-block="video-gallery">
      {galleryConfig.layout === 'grid' && (
        <div className={joinClassNames('grid gap-5', getVideoGalleryColumnsClass(galleryConfig.columns))}>
          {items.map((video, index) => (
            <article
              key={`${video.videoId}-${index}`}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]/85 shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl"
              onClick={() => handlePlayVideo(video)}
            >
              <div className={joinClassNames('relative overflow-hidden bg-black', getVideoGalleryAspectClass(galleryConfig.aspectRatio))}>
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt={video.title || 'Video thumbnail'}
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600/90 backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                  <svg className="ml-1 h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                {galleryConfig.showDurations && video.duration && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {video.duration}
                  </div>
                )}
              </div>

              {galleryConfig.showTitles && video.title && (
                <div className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)]/60 px-4 py-3">
                  <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[var(--text-primary)]">
                    {video.title}
                  </h3>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {galleryConfig.layout === 'list' && (
        <div className="space-y-4">
          {items.map((video, index) => (
            <article
              key={`${video.videoId}-${index}`}
              className="group flex cursor-pointer gap-4 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]/85 p-3 shadow-md transition-all hover:shadow-xl"
              onClick={() => handlePlayVideo(video)}
            >
              <div className="relative w-48 flex-shrink-0 overflow-hidden rounded-lg bg-black">
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt={video.title || 'Video thumbnail'}
                    className="aspect-video h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600/90 backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                  <svg className="ml-0.5 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                {galleryConfig.showDurations && video.duration && (
                  <div className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    {video.duration}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-center">
                {video.title && (
                  <h3 className="mb-1 line-clamp-2 text-base font-semibold leading-snug text-[var(--text-primary)]">
                    {video.title}
                  </h3>
                )}
                <p className="text-sm text-[var(--text-muted)]">Click para reproducir</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeVideo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
            aria-label="Cerrar video"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            className="relative w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
              <iframe
                src={getVideoEmbedUrl(activeVideo)}
                className="h-full w-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {activeVideo.title && (
              <div className="mt-4 text-center">
                <h2 className="text-lg font-medium text-white">{activeVideo.title}</h2>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
