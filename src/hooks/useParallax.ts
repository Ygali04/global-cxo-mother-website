"use client";
import { useEffect, useRef } from "react";

interface UseParallaxProps {
  speed?: number;
  direction?: "x" | "y";
}

export const useParallax = <T extends HTMLElement>({
  speed = 0.05,
  direction = "x",
}: UseParallaxProps = {}) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;

    let requestId: number;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const offset = rect.top - window.innerHeight / 2;
      const move = offset * speed;

      requestId = requestAnimationFrame(() => {
        const translate =
          direction === "x"
            ? `translate3d(${move}px, 0, 0)`
            : `translate3d(0, ${move}px, 0)`;

        el.style.transform = translate;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(requestId);
    };
  }, [speed, direction]);

  return ref;
};
