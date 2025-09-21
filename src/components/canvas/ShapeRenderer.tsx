import { type Shape } from '@/store/canvasStore';
import React from 'react';

interface ShapeRendererProps {
  shape: Shape;
  isSelected: boolean;
  onClick: (e: React.MouseEvent, shapeId: string) => void;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  shape,
  isSelected,
  onClick,
}) => {
  const commonProps = {
    onClick: (e: React.MouseEvent) => onClick(e, shape.id),
    style: {
      cursor: 'pointer',
      filter: isSelected
        ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
        : 'none',
    },
  };

  // Use world coordinates directly (viewBox handles zoom scaling)
  const worldX = shape.x;
  const worldY = shape.y;
  const worldWidth = shape.width;
  const worldHeight = shape.height;
  const worldStrokeWidth = shape.strokeWidth || 2;
  const worldFontSize = shape.fontSize || 16;

  switch (shape.type) {
    case 'rectangle':
      return (
        <rect
          key={shape.id}
          x={worldX}
          y={worldY}
          width={worldWidth}
          height={worldHeight}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={worldStrokeWidth}
          {...commonProps}
        />
      );

    case 'circle':
      const worldRadius = Math.min(worldWidth, worldHeight) / 2;
      return (
        <circle
          key={shape.id}
          cx={worldX + worldRadius}
          cy={worldY + worldRadius}
          r={worldRadius}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={worldStrokeWidth}
          {...commonProps}
        />
      );

    case 'text':
      return (
        <g key={shape.id} {...commonProps}>
          <rect
            x={worldX}
            y={worldY}
            width={worldWidth}
            height={worldHeight}
            fill="transparent"
            stroke={isSelected ? shape.stroke : 'transparent'}
            strokeWidth={worldStrokeWidth}
            strokeDasharray={isSelected ? '5,5' : 'none'}
          />
          <text
            x={worldX + 8}
            y={worldY + worldHeight / 2 + 4}
            fontSize={worldFontSize}
            fontFamily={shape.fontFamily}
            fill={shape.fill}
            dominantBaseline="middle"
          >
            {shape.text || 'Text'}
          </text>
        </g>
      );

    default:
      return null;
  }
};
