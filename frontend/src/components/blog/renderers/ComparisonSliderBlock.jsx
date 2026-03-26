import { useState, useRef, useEffect } from 'react';

export default function ComparisonSliderBlock({
    beforeImage,
    afterImage,
    beforeLabel = 'Antes',
    afterLabel = 'Después',
    initialPosition = 50,
}) {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const handleRef = useRef(null);

    // Update position when clicking directly on the container
    const handleClick = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setPosition(newPosition);
    };

    // Mouse drag handlers
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setPosition(newPosition);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch drag handlers
    const handleTouchStart = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging || !containerRef.current) return;
        
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setPosition(newPosition);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setPosition(prev => Math.max(0, prev - 5));
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setPosition(prev => Math.min(100, prev + 5));
        }
    };

    // Global mouse/touch event listeners while dragging
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleTouchEnd);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging]);

    // Prevent issues if images aren't provided
    if (!beforeImage || !afterImage) {
        return (
            <div className="my-6 flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-sm text-zinc-500">
                Comparador de imágenes: faltan imágenes
            </div>
        );
    }

    return (
        <div className="group/slider relative my-6">
            <div
                ref={containerRef}
                className="relative aspect-video w-full select-none overflow-hidden rounded-xl"
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="slider"
                aria-label="Deslizador de comparación de imágenes"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(position)}
            >
                {/* Before Image (full width) */}
                <div className="absolute inset-0">
                    <img
                        src={beforeImage}
                        alt={beforeLabel}
                        className="h-full w-full object-cover"
                        draggable={false}
                    />
                    {/* Before Label */}
                    <div className="absolute left-4 top-4 rounded-md bg-black/70 px-3 py-1.5 text-sm font-semibold text-white opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100">
                        {beforeLabel}
                    </div>
                </div>

                {/* After Image (clipped by position) */}
                <div
                    className="absolute inset-0 transition-[clip-path] duration-0"
                    style={{
                        clipPath: `inset(0 ${100 - position}% 0 0)`,
                    }}
                >
                    <img
                        src={afterImage}
                        alt={afterLabel}
                        className="h-full w-full object-cover"
                        draggable={false}
                    />
                    {/* After Label */}
                    <div className="absolute right-4 top-4 rounded-md bg-black/70 px-3 py-1.5 text-sm font-semibold text-white opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100">
                        {afterLabel}
                    </div>
                </div>

                {/* Draggable Handle */}
                <div
                    ref={handleRef}
                    className="absolute top-0 z-10 flex h-full -translate-x-1/2 cursor-ew-resize items-center"
                    style={{ left: `${position}%` }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    role="presentation"
                >
                    {/* Vertical Line */}
                    <div className="h-full w-[3px] bg-white shadow-lg shadow-black/50" />
                    
                    {/* Circular Grip */}
                    <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl shadow-black/50">
                        {/* Arrows Icon */}
                        <svg
                            className="h-6 w-6 text-zinc-800"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 8L22 12L18 16" />
                            <path d="M6 8L2 12L6 16" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Keyboard hint */}
            <p className="mt-2 text-center text-xs text-zinc-500">
                Arrastra el deslizador o usa las flechas del teclado para comparar
            </p>
        </div>
    );
}
