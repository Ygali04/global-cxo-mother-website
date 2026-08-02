'use client'
import { useEffect, useState } from "react";

interface StickyState {
   sticky: boolean;
}

const UseSticky = (): StickyState => {
   const [sticky, setSticky] = useState(false);

   const stickyHeader = (): void => {
      if (window.scrollY > 30) {
         setSticky(true);
      } else {
         setSticky(false);
      }
   };

   useEffect(() => {
      if (typeof window !== "undefined") {
         if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
         }
         if (window.scrollY < 200) {
            window.scrollTo(0, 0);
         }
      }

      stickyHeader();
      window.addEventListener("scroll", stickyHeader, { passive: true });

      return (): void => {
         window.removeEventListener("scroll", stickyHeader);
      };
   }, []);

   return {
      sticky,
   };
}

export default UseSticky;