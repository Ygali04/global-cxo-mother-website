"use client";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className = "",
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={`aurora-bg-container ${className}`}
      {...props}
    >
      <div className="aurora-bg-overflow">
        <div
          className="aurora-bg-gradient"
          data-radial={showRadialGradient ? "true" : "false"}
        ></div>
      </div>
      <div style={{ position: "relative", zIndex: 10, width: "100%" }}>
        {children}
      </div>
    </div>
  );
};
