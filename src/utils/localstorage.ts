export const setLocalStorage = <T>(name: string, items: T[]): void => {
   if (typeof window !== "undefined" && window.localStorage) {
      try {
         localStorage.setItem(name, JSON.stringify(items));
      } catch (error) {
         console.error("Error saving to localStorage:", error);
      }
   }
};

export const getLocalStorage = <T>(name: string): T[] => {
   if (typeof window !== "undefined" && window.localStorage) {
      try {
         const data = localStorage.getItem(name);
         if (data) {
            return JSON.parse(data) as T[];
         }
      } catch (error) {
         console.error("Error reading from localStorage:", error);
      }
   }
   return [];
};
