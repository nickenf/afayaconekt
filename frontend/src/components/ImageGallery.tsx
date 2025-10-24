import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ImageGalleryProps {
    images: string[];
    altPrefix: string;
}

export const ImageGallery = ({ images, altPrefix }: ImageGalleryProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State for zoom and pan
    const [transform, setTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const panStartRef = useRef({ x: 0, y: 0 });

    const resetTransform = useCallback(() => {
        setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    }, []);

    const openModal = (index: number) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        document.body.style.overflow = ''; // Restore background scrolling
        resetTransform();
    }, [resetTransform]);

    const showNext = useCallback(() => {
        resetTransform();
        setSelectedIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length, resetTransform]);

    const showPrev = useCallback(() => {
        resetTransform();
        setSelectedIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length, resetTransform]);
    
    // Keyboard navigation for modal
    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'Escape') closeModal();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, showNext, showPrev, closeModal]);
    
    // Zoom handler (Ctrl + Scroll)
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            setTransform(prev => {
                const newScale = Math.min(Math.max(1, prev.scale + delta), 5);
                return { ...prev, scale: newScale };
            });
        }
    };

    // Pan handlers (Mouse)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (transform.scale <= 1) return;
        e.preventDefault();
        panStartRef.current = { x: e.clientX - transform.offsetX, y: e.clientY - transform.offsetY };
        setIsPanning(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        e.preventDefault();
        setTransform(prev => ({
            ...prev,
            offsetX: e.clientX - panStartRef.current.x,
            offsetY: e.clientY - panStartRef.current.y
        }));
    };

    const handleMouseUpOrLeave = () => {
        setIsPanning(false);
    };

    // Double-click to reset zoom/pan
    const handleDoubleClick = () => {
        if (transform.scale > 1 || transform.offsetX !== 0 || transform.offsetY !== 0) {
            resetTransform();
        }
    };

    // --- Touch Handlers for Pinch-to-Zoom and Pan ---
    const touchRef = useRef({ initialDistance: 0, isPinching: false });
    
    const getDistance = (touches: React.TouchList) => {
        return Math.sqrt(
            Math.pow(touches[0].clientX - touches[1].clientX, 2) +
            Math.pow(touches[0].clientY - touches[1].clientY, 2)
        );
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) { // Pinch start
             e.preventDefault();
             touchRef.current.initialDistance = getDistance(e.touches);
             touchRef.current.isPinching = true;
        } else if (e.touches.length === 1 && transform.scale > 1) { // Pan start
             e.preventDefault();
             panStartRef.current = { x: e.touches[0].clientX - transform.offsetX, y: e.touches[0].clientY - transform.offsetY };
             setIsPanning(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchRef.current.isPinching && e.touches.length === 2) { // Pinching
            e.preventDefault();
            const newDistance = getDistance(e.touches);
            const scaleRatio = newDistance / touchRef.current.initialDistance;
            setTransform(prev => ({ ...prev, scale: Math.min(Math.max(1, prev.scale * scaleRatio), 5) }));
            touchRef.current.initialDistance = newDistance; // Update for continuous zoom
        } else if (isPanning && e.touches.length === 1) { // Panning
            e.preventDefault();
            setTransform(prev => ({
                ...prev,
                offsetX: e.touches[0].clientX - panStartRef.current.x,
                offsetY: e.touches[0].clientY - panStartRef.current.y
            }));
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) {
            touchRef.current.isPinching = false;
        }
        if (e.touches.length < 1) {
            setIsPanning(false);
        }
    };

    if (!images || images.length === 0) {
        return null;
    }
    
    const cursorStyle = () => {
        if (isPanning) return 'grabbing';
        if (transform.scale > 1) return 'grab';
        return 'zoom-in';
    };


    return (
        <div className="mb-10">
            {/* Main Image Preview */}
            <div className="mb-4 rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.02] transition-transform duration-300">
                <img
                    src={images[selectedIndex]}
                    alt={`${altPrefix} gallery image ${selectedIndex + 1}`}
                    className="w-full h-96 object-cover"
                    onClick={() => openModal(selectedIndex)}
                    aria-label="View larger image"
                />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {images.map((url, index) => (
                    <img
                        key={index}
                        src={url}
                        alt={`${altPrefix} thumbnail ${index + 1}`}
                        className={`w-full h-24 object-cover rounded-md cursor-pointer border-4 transition-all duration-200 ${
                            selectedIndex === index ? 'border-primary' : 'border-transparent hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedIndex(index)}
                    />
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/90 flex justify-center items-center z-[1000] animate-fade-in"
                    onClick={closeModal}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image gallery"
                >
                    <div
                        ref={imageContainerRef}
                        className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                        onDoubleClick={handleDoubleClick}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-0 right-0 m-4 text-white text-5xl hover:text-gray-300 transition-colors z-20 bg-black/20 rounded-full w-12 h-12 flex items-center justify-center leading-none"
                            aria-label="Close gallery"
                        >
                            &times;
                        </button>
                        
                        {/* Image */}
                        <img
                            src={images[selectedIndex]}
                            alt={`${altPrefix} gallery image ${selectedIndex + 1}`}
                            className="max-w-full max-h-full object-contain select-none"
                            style={{
                                transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
                                cursor: cursorStyle(),
                                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                                touchAction: 'none'
                            }}
                        />
                        
                        {/* Prev Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); showPrev(); }}
                            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition-colors"
                            aria-label="Previous image"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); showNext(); }}
                            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition-colors"
                            aria-label="Next image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};