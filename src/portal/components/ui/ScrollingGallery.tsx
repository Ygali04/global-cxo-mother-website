import React from 'react';

interface ScrollingGalleryItem {
  id: string;
  image: string;
  name: string;
  website?: string;
  onClick?: () => void;
}

interface ScrollingGalleryProps {
  items: ScrollingGalleryItem[];
  title?: string;
  showTitle?: boolean;
  className?: string;
  itemClassName?: string;
  speed?: number; // Animation speed multiplier
  height?: string; // Height of the gallery container
  itemWidth?: string; // Width of each item
  grayscale?: boolean; // Apply grayscale filter
  spacing?: number; // Spacing between items in pixels
}

const ScrollingGallery: React.FC<ScrollingGalleryProps> = ({
  items,
  title = "Gallery",
  showTitle = true,
  className = "",
  itemClassName = "",
  speed = 3.5,
  height = "h-16",
  itemWidth = "w-36",
  grayscale = true,
  spacing = 0
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  const handleItemClick = (item: ScrollingGalleryItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.website) {
      window.open(item.website, '_blank');
    }
  };

  // Helper function to check if item is AIVAR logo
  const isAivarLogo = (item: ScrollingGalleryItem) => {
    return item.image.includes('aivar.png') || item.name.toLowerCase().includes('aivar');
  };

  // Create a continuous belt of items by duplicating the array
  // This ensures there's no gap between the end and the beginning
  const continuousBelt = [...items, ...items];
  
  // Calculate item width in pixels for positioning
  const itemWidthPx = parseInt(itemWidth.replace('w-', '')) * 4; // Approximate pixel width
  
  // Calculate total width of a single set of items
  const singleSetWidth = items.length * (itemWidthPx + spacing);

  return (
    <div className={`mb-20 scrollbar-hide ${className}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflow: 'hidden' }}>
      {showTitle && (
        <h2 className="text-4xl font-bold text-navy-dark mb-0 mt-20 text-center">{title}</h2>
      )}
      
      <div className="relative overflow-hidden bg-white py-16 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Fade out effects on both sides */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        {/* Continuously scrolling items as a continuous belt */}
        <div className="flex relative scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflow: 'hidden' }}>
          <div className="animate-scroll-belt" style={{ 
            display: 'flex',
            width: `${singleSetWidth * 2}px`,
            animationDuration: `${speed * items.length}s`
          }}>
            {continuousBelt.map((item, index) => {
              const isAivar = isAivarLogo(item);
              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${itemClassName}`}
                  style={{
                    marginRight: `${spacing}px`,
                    width: `${itemWidthPx}px`,
                    flexShrink: 0
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className={`flex items-center justify-center ${height}`}>
                    <img
                      src={item.image}
                      alt={`${item.name} image`}
                      className={`object-contain transition-all duration-300 ${
                        grayscale ? 'filter grayscale hover:grayscale-0' : ''
                      }`}
                      style={{
                        maxHeight: isAivar ? '150%' : '100%',
                        maxWidth: isAivar ? '150%' : '100%',
                        height: isAivar ? 'auto' : 'auto',
                        width: isAivar ? 'auto' : 'auto'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-scroll-belt {
          animation: scroll-belt linear infinite;
        }
        
        @keyframes scroll-belt {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${singleSetWidth}px);
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollingGallery; 