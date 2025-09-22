import type { Connector, Shape } from '@/store/canvasStore';
import React from 'react';

interface ShapeRendererProps {
  entity: Shape | Connector;
  isSelected: boolean;
  onClick: (e: React.MouseEvent, shapeId: string) => void;
  type: 'shape' | 'connector';
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  entity,
  isSelected,
  onClick,
  type,
}) => {
  const commonProps = {
    onClick: (e: React.MouseEvent) => onClick(e, entity.id),
    style: {
      cursor: 'pointer',
      filter: isSelected
        ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
        : 'none',
    },
  };

  const worldX = entity.x;
  const worldY = entity.y;
  const worldStrokeWidth = entity.strokeWidth || 2;

  if (type === 'shape') {
    const shape = entity as Shape;
    const worldWidth = shape.width;
    const worldHeight = shape.height;
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
  } else {
    const connector = entity as Connector;
    const markerId = `arrowhead-${connector.id}`;

    return (
      <g key={connector.id} {...commonProps}>
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={connector.stroke} />
          </marker>
        </defs>
        <line
          x1={connector.x}
          y1={connector.y}
          x2={connector.targetX}
          y2={connector.targetY}
          stroke={connector.stroke}
          strokeWidth={connector.strokeWidth}
          markerEnd={`url(#${markerId})`}
        />
      </g>
    );
  }
};
