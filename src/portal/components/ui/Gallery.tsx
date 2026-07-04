import React, { useState } from 'react';
import { X } from 'lucide-react';

interface GalleryProps {
  images: string[];
  title?: string;
  showTitle?: boolean;
  className?: string;
  imageClassName?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  onImageClick?: (index: number) => void;
  lightbox?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({
  images,
  title = "Gallery",
  showTitle = true,
  className = "",
  imageClassName = "",
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  onImageClick,
  lightbox = true
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
    }
    if (lightbox) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getGridClasses = () => {
    const mobileClass = `grid-cols-${columns.mobile || 2}`;
    const tabletClass = `md:grid-cols-${columns.tablet || 3}`;
    const desktopClass = `lg:grid-cols-${columns.desktop || 4}`;
    return `grid gap-4 ${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`mb-12 ${className}`}>
      {showTitle && (
        <h2 className="text-3xl font-bold text-navy-dark mb-8">{title}</h2>
      )}
      
      <div className={getGridClasses()}>
        {images.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt={`${title} image ${index + 1}`}
            className={`w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer ${imageClassName}`}
            onClick={() => handleImageClick(index)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightbox && lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <X size={24} className="text-gray-600" />
            </button>
            
            <img
              src={images[currentImageIndex]}
              alt={`${title} image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery; 