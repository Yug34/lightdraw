import React from 'react';

interface GridBackgroundProps {
  gridSize?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  gridSize = 20,
  strokeColor = '#000000',
  strokeWidth = 0.5,
}) => {
  return (
    <defs>
      <pattern
        id="grid"
        width={gridSize}
        height={gridSize}
        patternUnits="userSpaceOnUse"
      >
        <path
          d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </pattern>
    </defs>
  );
};
