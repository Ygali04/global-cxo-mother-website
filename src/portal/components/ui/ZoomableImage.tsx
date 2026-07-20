import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  onClose?: () => void;
  className?: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ 
  src, 
  alt, 
  onClose, 
  className = '' 
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 5;
  const ZOOM_STEP = 0.3;

  // Get distance between two touch points
  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Get center point between two touches
  const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
    if (touches.length < 2) return { x: 0, y: 0 };
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // Reset zoom and position
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Zoom in/out with buttons
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - ZOOM_STEP, MIN_SCALE));
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale(prev => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta)));
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Start pinch zoom
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      // Start pan
      setIsDragging(true);
      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scaleFactor = distance / lastTouchDistance;
        setScale(prev => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev * scaleFactor)));
      }
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan when zoomed in
      const deltaX = e.touches[0].clientX - lastPanPoint.x;
      const deltaY = e.touches[0].clientY - lastPanPoint.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  }, [isDragging, lastPanPoint, lastTouchDistance, scale]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(0);
  }, []);

  // Handle mouse events for pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [scale]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && scale > 1) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastPanPoint, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse wheel
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events for pan
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseMove, handleMouseUp]);

  // Constrain position when scale changes
  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const image = imageRef.current;
    
    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    
    const maxX = Math.max(0, (imageRect.width * scale - containerRect.width) / 2);
    const maxY = Math.max(0, (imageRect.height * scale - containerRect.height) / 2);
    
    setPosition(prev => ({
      x: Math.max(-maxX, Math.min(maxX, prev.x)),
      y: Math.max(-maxY, Math.min(maxY, prev.y))
    }));
  }, [scale]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[10001] flex items-center justify-center">
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handleZoomIn}
          disabled={scale >= MAX_SCALE}
          className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={scale <= MIN_SCALE}
          className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut size={20} className="text-gray-700" />
        </button>
        <button
          onClick={resetZoom}
          className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-opacity-100 transition-all duration-200"
          title="Reset Zoom"
        >
          <RotateCcw size={20} className="text-gray-700" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-opacity-100 transition-all duration-200"
            title="Close"
          >
            <X size={20} className="text-gray-700" />
          </button>
        )}
      </div>

      {/* Zoom level indicator */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 shadow-lg z-10">
        <span className="text-gray-700 font-medium">{Math.round(scale * 100)}%</span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-lg z-10">
        <span className="text-gray-700 text-sm">
          {scale > 1 ? 'Drag to pan • ' : ''}Pinch or scroll to zoom • Tap controls to zoom
        </span>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="max-w-none max-h-none object-contain transition-transform duration-200 select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center center'
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ZoomableImage; 