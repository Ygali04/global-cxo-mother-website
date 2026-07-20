import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/portal/lib/utils';

/**
 * Horizontally scrollable container with edge fade-out gradients.
 *
 * Two purposes in one component:
 *   1. "subtle" variant — barely-visible 16px fades, used to hint at
 *      horizontal overflow on data tables. The fades only render when
 *      content actually overflows AND only on the side(s) where there's
 *      more content to scroll toward.
 *   2. "bold" variant — full 80px fades, custom thin scrollbar at the
 *      bottom, used for spotlight scroll regions where the scroll
 *      itself is the UI feature (carousels, chip strips, etc.).
 *
 * Browser scrollbars are HIDDEN in both variants — we hide via
 * `scrollbar-width: none` (Firefox) and `::-webkit-scrollbar { display: none }`
 * (Chrome/Safari/Edge), and the bold variant draws its own thin scrollbar
 * via the .faded-scroll-bold custom CSS class declared in src/index.css.
 *
 * The fades use mask-image instead of overlay divs so they work on any
 * background color — gradient overlays only work when you know the
 * underlying surface is white. mask-image fades the actual content,
 * which means tables, cards, dark backgrounds, all work transparently.
 */
export interface FadedScrollProps {
  /** Render content here. Will be the scroll target. */
  children: React.ReactNode;
  /** "subtle" for tables, "bold" for spotlight scroll areas. */
  variant?: 'subtle' | 'bold';
  /** Extra classes for the outer container (e.g. border, rounded). */
  className?: string;
  /** Extra classes applied to the inner scrollable element. */
  scrollClassName?: string;
}

const FadedScroll: React.FC<FadedScrollProps> = ({
  children,
  variant = 'subtle',
  className,
  scrollClassName,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasLeftOverflow, setHasLeftOverflow] = useState(false);
  const [hasRightOverflow, setHasRightOverflow] = useState(false);

  // Recalculate overflow state on scroll, resize, and child mutations.
  // We don't use ResizeObserver on every node — just the scroll target —
  // because that's where the cumulative width changes when columns expand
  // or filters reduce the row count.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const left = el.scrollLeft > 1;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setHasLeftOverflow(left);
      setHasRightOverflow(right);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // MutationObserver catches column/row changes that don't trigger a resize
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  // Mask gradient: a horizontal mask that fades the content to transparent
  // at whichever edges have more content to scroll toward. We build the
  // mask string conditionally so a fully-visible (no overflow) container
  // gets no fade at all, and an at-the-leftmost-position container only
  // fades on the right side.
  const fadeWidth = variant === 'bold' ? '80px' : '24px';
  const maskParts: string[] = [];
  if (hasLeftOverflow) {
    maskParts.push(`linear-gradient(to right, transparent 0, black ${fadeWidth})`);
  }
  if (hasRightOverflow) {
    maskParts.push(
      `linear-gradient(to left, transparent 0, black ${fadeWidth})`,
    );
  }
  const maskImage =
    maskParts.length === 0
      ? undefined
      : maskParts.length === 1
      ? maskParts[0]
      : // When BOTH edges fade, we need to combine masks. Two linear
        // gradients combined via mask-composite ('intersect') yield a
        // band that's transparent at both ends and fully opaque in the
        // middle.
        maskParts.join(', ');
  const maskStyle: React.CSSProperties =
    maskImage && maskParts.length === 2
      ? {
          maskImage,
          WebkitMaskImage: maskImage,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }
      : maskImage
      ? { maskImage, WebkitMaskImage: maskImage }
      : {};

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollRef}
        className={cn(
          // hide native scrollbars across browsers
          'overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // bold variant gets the custom-drawn thin scrollbar styled in index.css
          variant === 'bold' && 'faded-scroll-bold pb-3',
          scrollClassName,
        )}
        style={maskStyle}
      >
        {children}
      </div>
    </div>
  );
};

export default FadedScroll;
