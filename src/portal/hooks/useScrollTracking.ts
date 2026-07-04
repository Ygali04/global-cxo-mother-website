import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
}

class ScrollTracker {
  private positions: Map<string, ScrollPosition> = new Map();

  setPosition(path: string, position: ScrollPosition) {
    this.positions.set(path, position);
  }

  getPosition(path: string): ScrollPosition {
    return this.positions.get(path) || { x: 0, y: 0 };
  }

  clearPosition(path: string) {
    this.positions.delete(path);
  }
}

// Global instance to persist across component unmounts
const scrollTracker = new ScrollTracker();

export const useScrollTracking = () => {
  const location = useLocation();
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    // Handle scroll restoration when location changes
    const restoreScroll = () => {
      setIsRestoring(true);
      
      let targetPosition: ScrollPosition;
      
      // Special handling for home page - reset to top only if position is in parallax area
      if (location.pathname === '/') {
        const savedPosition = scrollTracker.getPosition('/');
        
        // If saved position is past the parallax section (2000px+), restore it
        // Otherwise, reset to top to avoid parallax issues
        if (savedPosition.y > 2000) {
          targetPosition = savedPosition;
        } else {
          targetPosition = { x: 0, y: 0 };
          // Clear the problematic position
          scrollTracker.clearPosition('/');
        }
      } else {
        targetPosition = scrollTracker.getPosition(location.pathname);
      }
      
      // Immediate scroll without animation to prevent flash
      window.scrollTo(targetPosition.x, targetPosition.y);
      
      // Short delay to ensure scroll is complete before showing content normally
      setTimeout(() => {
        setIsRestoring(false);
      }, 50);
    };

    // Use requestAnimationFrame to ensure DOM is ready, but make it immediate
    requestAnimationFrame(restoreScroll);
  }, [location.pathname]);

  useEffect(() => {
    // Save scroll position before leaving page
    const saveScrollPosition = () => {
      const currentPath = location.pathname;
      
      // For home page, only save position if we're past the parallax section
      // This prevents restoring to middle of parallax zoom
      if (currentPath === '/') {
        const scrollY = window.scrollY;
        // Only save if we're well past the initial hero section (e.g., 2000px+)
        // This ensures we don't restore to middle of parallax
        if (scrollY > 2000) {
          scrollTracker.setPosition(currentPath, {
            x: window.scrollX,
            y: scrollY
          });
        } else {
          // Clear any saved position if we're in the hero/parallax area
          scrollTracker.clearPosition(currentPath);
        }
      } else {
        // For non-home pages, save normally
        scrollTracker.setPosition(currentPath, {
          x: window.scrollX,
          y: window.scrollY
        });
      }
    };

    // Save on scroll (throttled)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (isRestoring) return; // Don't save while restoring
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveScrollPosition, 150);
    };

    // Save on beforeunload and visibility change
    const handleBeforeUnload = () => {
      if (!isRestoring) {
        saveScrollPosition();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isRestoring) {
        saveScrollPosition();
      }
    };

    // Only add listeners if not currently restoring
    if (!isRestoring) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearTimeout(scrollTimeout);
      if (!isRestoring) {
        saveScrollPosition(); // Save current position when component unmounts
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname, isRestoring]);

  return {
    isRestoring,
    clearScrollPosition: (path: string) => scrollTracker.clearPosition(path),
    getCurrentPosition: () => ({ x: window.scrollX, y: window.scrollY }),
    getSavedPosition: (path: string) => scrollTracker.getPosition(path)
  };
}; 