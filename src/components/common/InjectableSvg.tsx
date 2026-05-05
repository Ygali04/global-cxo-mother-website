"use client"
import React, { useEffect, useRef } from 'react';
import Vivus from 'vivus';

interface InjectableSvgProps {
   src: string;
   alt?: string;
   className?: string;
}

const InjectableSvg: React.FC<InjectableSvgProps> = ({ src, alt = '', className = '' }) => {
   const containerRef = useRef<HTMLSpanElement>(null);

   useEffect(() => {
      let mounted = true;
      let vivusInstance: Vivus | null = null;
      let svgElement: SVGElement | null = null;

      const fetchAndInjectSvg = async () => {
         if (!containerRef.current) {
            return;
         }

         try {
            const response = await fetch(src);

            if (!response.ok) {
               throw new Error(`Failed to fetch SVG: ${response.status}`);
            }

            const svgText = await response.text();

            if (!mounted || !containerRef.current) {
               return;
            }

            const div = document.createElement('div');
            div.innerHTML = svgText;
            svgElement = div.querySelector('svg');

            if (!svgElement) {
               return;
            }

            svgElement.setAttribute('class', `injectable ${className}`.trim());
            if (alt) {
               svgElement.setAttribute('aria-label', alt);
               svgElement.setAttribute('role', 'img');
            }

            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(svgElement);

            vivusInstance = new Vivus(svgElement as unknown as HTMLElement, {
               duration: 80,
            });

            vivusInstance.finish();
            svgElement.addEventListener('mouseenter', handleMouseEnter);
         } catch (error) {
            if (!mounted) {
               return;
            }

            if (containerRef.current) {
               containerRef.current.innerHTML = '';
               const fallbackImg = document.createElement('img');
               fallbackImg.src = src;
               fallbackImg.alt = alt;
               fallbackImg.className = `injectable ${className}`.trim();
               containerRef.current.appendChild(fallbackImg);
            }

            console.error('Error fetching and injecting SVG:', error);
         }
      }

      const handleMouseEnter = () => {
         vivusInstance?.reset().play();
      }

      fetchAndInjectSvg();

      return () => {
         mounted = false;
         if (svgElement) {
            svgElement.removeEventListener('mouseenter', handleMouseEnter);
         }
      }
   }, [src]);

   return (
      <span ref={containerRef}>
         <img src={src} alt={alt} className={`injectable ${className}`} />
      </span>
   );
};

export default InjectableSvg;


