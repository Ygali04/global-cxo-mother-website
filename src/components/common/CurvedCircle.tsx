import React from "react";

interface CurvedCircleProps {
   text: string;
   className?: string;
   degreeStep?: number;
}

const CurvedCircle: React.FC<CurvedCircleProps> = ({
   text,
   className = "circle",
   degreeStep = 9.1,
}) => {
   return (
      <h6 className={`${className} rotateme`}>
         {text.split("").map((char, i) => (
            <span key={i} style={{ transform: `rotate(${i * degreeStep}deg)` }}>
               {char === " " ? "\u00A0" : char}
            </span>
         ))}
      </h6>
   );
};

export default CurvedCircle;
