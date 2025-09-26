import type { Connector, Shape } from '@/store/canvasStore';
import { useCanvas } from '@/hooks';
import React, { useRef, useEffect } from 'react';

interface ShapeRendererProps {
  entity: Shape | Connector;
  isSelected: boolean;
  onClick: (e: React.MouseEvent, shapeId: string) => void;
  onMouseDown?: (e: React.MouseEvent, shapeId: string) => void;
  type: 'shape' | 'connector';
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  entity,
  isSelected,
  onClick,
  onMouseDown,
  type,
}) => {
  const commonProps = {
    onClick: (e: React.MouseEvent) => onClick(e, entity.id),
    onMouseDown: (e: React.MouseEvent) =>
      onMouseDown && onMouseDown(e, entity.id),
    style: {
      cursor: 'pointer',
      filter: isSelected
        ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
        : 'none',
    },
  };

  if (type === 'shape') {
    const shape = entity as Shape;
    return renderShape(shape, isSelected, commonProps);
  } else {
    const connector = entity as Connector;
    return renderConnector(connector, commonProps);
  }
};

const renderShape = (shape: Shape, isSelected: boolean, commonProps: any) => {
  const worldX = shape.x;
  const worldY = shape.y;
  const worldStrokeWidth = shape.strokeWidth || 2;
  const rotation = shape.rotation || 0;
  const worldWidth = shape.width;
  const worldHeight = shape.height;
  const worldFontSize = shape.fontSize || 16;

  switch (shape.type) {
    case 'rectangle':
      return (
        <ShapeWithHandles
          shape={shape}
          isSelected={isSelected}
          worldX={worldX}
          worldY={worldY}
          worldWidth={worldWidth}
          worldHeight={worldHeight}
          rotation={rotation}
          commonProps={commonProps}
        >
          <rect
            key={shape.id}
            x={0}
            y={0}
            width={worldWidth}
            height={worldHeight}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={worldStrokeWidth}
            {...commonProps}
          />
        </ShapeWithHandles>
      );

    case 'circle':
      const worldRadius = Math.min(worldWidth, worldHeight) / 2;
      return (
        <ShapeWithHandles
          shape={shape}
          isSelected={isSelected}
          worldX={worldX}
          worldY={worldY}
          worldWidth={worldWidth}
          worldHeight={worldHeight}
          rotation={rotation}
          commonProps={commonProps}
        >
          <circle
            key={shape.id}
            cx={0}
            cy={0}
            r={worldRadius}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={worldStrokeWidth}
            {...commonProps}
          />
        </ShapeWithHandles>
      );

    case 'text':
      return (
        <ShapeWithHandles
          shape={shape}
          isSelected={isSelected}
          worldX={worldX}
          worldY={worldY}
          worldWidth={worldWidth}
          worldHeight={worldHeight}
          rotation={rotation}
          commonProps={commonProps}
        >
          <rect
            x={0}
            y={0}
            width={worldWidth}
            height={worldHeight}
            fill="transparent"
            stroke={isSelected ? shape.stroke : 'transparent'}
            strokeWidth={worldStrokeWidth}
            strokeDasharray={isSelected ? '5,5' : 'none'}
          />
          <text
            x={8}
            y={worldHeight / 2 + 4}
            fontSize={worldFontSize}
            fontFamily={shape.fontFamily}
            fill={shape.fill}
            dominantBaseline="middle"
          >
            {shape.text || 'Text'}
          </text>
        </ShapeWithHandles>
      );

    default:
      return null;
  }
};

const renderConnector = (connector: Connector, commonProps: any) => {
  const strokeWidth = connector.strokeWidth || 2;
  const stroke = connector.stroke || '#000000';

  switch (connector.type) {
    case 'line':
      return (
        <g key={connector.id} {...commonProps}>
          <line
            x1={connector.x}
            y1={connector.y}
            x2={connector.targetX}
            y2={connector.targetY}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </g>
      );

    case 'arrow':
      const arrowMarkerId = `arrowhead-${connector.id}`;
      // Calculate arrowhead position
      const dx = connector.targetX - connector.x;
      const dy = connector.targetY - connector.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / length;
      const unitY = dy / length;
      const arrowheadX = connector.targetX - unitX * 10; // 10px from end
      const arrowheadY = connector.targetY - unitY * 10;

      return (
        <g key={connector.id} {...commonProps}>
          <defs>
            <marker
              id={arrowMarkerId}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
            </marker>
          </defs>
          <line
            x1={connector.x}
            y1={connector.y}
            x2={connector.targetX}
            y2={connector.targetY}
            stroke={stroke}
            strokeWidth={strokeWidth}
            markerEnd={`url(#${arrowMarkerId})`}
          />
          {/* Invisible clickable area over arrowhead */}
          <circle
            cx={arrowheadX}
            cy={arrowheadY}
            r="8"
            fill="transparent"
            pointerEvents="all"
          />
        </g>
      );

    case 'double-arrow':
      const doubleArrowStartMarkerId = `arrowhead-start-${connector.id}`;
      const doubleArrowEndMarkerId = `arrowhead-end-${connector.id}`;
      // Calculate arrowhead positions
      const doubleDx = connector.targetX - connector.x;
      const doubleDy = connector.targetY - connector.y;
      const doubleLength = Math.sqrt(doubleDx * doubleDx + doubleDy * doubleDy);
      const doubleUnitX = doubleDx / doubleLength;
      const doubleUnitY = doubleDy / doubleLength;
      const startArrowheadX = connector.x + doubleUnitX * 10; // 10px from start
      const startArrowheadY = connector.y + doubleUnitY * 10;
      const endArrowheadX = connector.targetX - doubleUnitX * 10; // 10px from end
      const endArrowheadY = connector.targetY - doubleUnitY * 10;

      return (
        <g key={connector.id} {...commonProps}>
          <defs>
            <marker
              id={doubleArrowStartMarkerId}
              markerWidth="10"
              markerHeight="7"
              refX="1"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="10 0, 0 3.5, 10 7" fill={stroke} />
            </marker>
            <marker
              id={doubleArrowEndMarkerId}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
            </marker>
          </defs>
          <line
            x1={connector.x}
            y1={connector.y}
            x2={connector.targetX}
            y2={connector.targetY}
            stroke={stroke}
            strokeWidth={strokeWidth}
            markerStart={`url(#${doubleArrowStartMarkerId})`}
            markerEnd={`url(#${doubleArrowEndMarkerId})`}
          />
          {/* Invisible clickable areas over arrowheads */}
          <circle
            cx={startArrowheadX}
            cy={startArrowheadY}
            r="8"
            fill="transparent"
            pointerEvents="all"
          />
          <circle
            cx={endArrowheadX}
            cy={endArrowheadY}
            r="8"
            fill="transparent"
            pointerEvents="all"
          />
        </g>
      );

    case 'dotted':
      const dottedArrowMarkerId = `dotted-arrowhead-${connector.id}`;
      // Calculate arrowhead position
      const dottedDx = connector.targetX - connector.x;
      const dottedDy = connector.targetY - connector.y;
      const dottedLength = Math.sqrt(dottedDx * dottedDx + dottedDy * dottedDy);
      const dottedUnitX = dottedDx / dottedLength;
      const dottedUnitY = dottedDy / dottedLength;
      const dottedArrowheadX = connector.targetX - dottedUnitX * 10; // 10px from end
      const dottedArrowheadY = connector.targetY - dottedUnitY * 10;

      return (
        <g key={connector.id} {...commonProps}>
          <defs>
            <marker
              id={dottedArrowMarkerId}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
            </marker>
          </defs>
          {/* Invisible hit area for better click detection */}
          <line
            x1={connector.x}
            y1={connector.y}
            x2={connector.targetX}
            y2={connector.targetY}
            stroke="transparent"
            strokeWidth={Math.max(strokeWidth * 3, 8)}
            pointerEvents="stroke"
          />
          {/* Visible dotted line */}
          <line
            x1={connector.x}
            y1={connector.y}
            x2={connector.targetX}
            y2={connector.targetY}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={connector.dashArray || '5,5'}
            markerEnd={`url(#${dottedArrowMarkerId})`}
            pointerEvents="none"
          />
          {/* Invisible clickable area over arrowhead */}
          <circle
            cx={dottedArrowheadX}
            cy={dottedArrowheadY}
            r="8"
            fill="transparent"
            pointerEvents="all"
          />
        </g>
      );

    default:
      const defaultArrowMarkerId = `default-arrowhead-${connector.id}`;
      // Calculate arrowhead position
      const defaultDx = connector.targetX - connector.x;
      const defaultDy = connector.targetY - connector.y;
      const defaultLength = Math.sqrt(
        defaultDx * defaultDx + defaultDy * defaultDy
      );
      const defaultUnitX = defaultDx / defaultLength;
      const defaultUnitY = defaultDy / defaultLength;
      const defaultArrowheadX = connector.targetX - defaultUnitX * 10; // 10px from end
      const defaultArrowheadY = connector.targetY - defaultUnitY * 10;

      return (
        <g key={connector.id} {...commonProps}>
          <defs>
            <marker
              id={defaultArrowMarkerId}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
            </marker>
          </defs>
          <line
            x1={connector.x}
            y1={connector.y}
            x2={connector.targetX}
            y2={connector.targetY}
            stroke={stroke}
            strokeWidth={strokeWidth}
            markerEnd={`url(#${defaultArrowMarkerId})`}
          />
          {/* Invisible clickable area over arrowhead */}
          <circle
            cx={defaultArrowheadX}
            cy={defaultArrowheadY}
            r="8"
            fill="transparent"
            pointerEvents="all"
          />
        </g>
      );
  }
};

interface ShapeWithHandlesProps {
  shape: Shape;
  isSelected: boolean;
  worldX: number;
  worldY: number;
  worldWidth: number;
  worldHeight: number;
  rotation: number;
  commonProps: any;
  children: React.ReactNode;
}

interface SelectionHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

const HANDLE_SIZE = 6;

const ShapeWithHandles: React.FC<ShapeWithHandlesProps> = ({
  shape,
  isSelected,
  worldX,
  worldY,
  worldWidth,
  worldHeight,
  rotation,
  commonProps,
  children,
}) => {
  const { selectedEntityIds } = useCanvas();

  // Create the transform for the shape content
  // For circles, we only need to translate to center and rotate
  // For rectangles and text, we need the full transform
  const isCircle = shape.type === 'circle';
  const transform = isCircle
    ? `translate(${worldX + worldWidth / 2}, ${worldY + worldHeight / 2}) rotate(${rotation})`
    : `translate(${worldX + worldWidth / 2}, ${worldY + worldHeight / 2}) rotate(${rotation}) translate(${-worldWidth / 2}, ${-worldHeight / 2})`;

  return (
    <g key={shape.id} {...commonProps}>
      {/* Shape content with rotation */}
      <g transform={transform}>{children}</g>

      {isSelected && selectedEntityIds.length === 1 && (
        <SelectionHandles
          x={worldX}
          y={worldY}
          width={worldWidth}
          height={worldHeight}
          rotation={rotation}
        />
      )}
    </g>
  );
};

const SelectionHandles: React.FC<SelectionHandlesProps> = ({
  x,
  y,
  width,
  height,
  rotation = 0,
}) => {
  const {
    setIsRotating,
    setIsResizing,
    isRotating,
    isResizing,
    rotateShape,
    resizeShape,
    selectedEntityIds,
    viewport,
  } = useCanvas();
  const handleContainerRef = useRef<SVGRectElement>(null);
  const initialAngleRef = useRef<number>(0);
  const initialMouseAngleRef = useRef<number>(0);
  const initialResizeDataRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    mouseX: number;
    mouseY: number;
    handle: string;
    rotation: number;
  } | null>(null);
  const half = HANDLE_SIZE / 2;
  const cx = x + width / 2;
  const cy = y + height / 2;

  // Handle global mouse move for rotation and resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (
        isRotating &&
        handleContainerRef.current &&
        selectedEntityIds.length === 1
      ) {
        const rect = handleContainerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const currentMouseAngle =
          (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) /
          Math.PI;
        const angleDelta = currentMouseAngle - initialMouseAngleRef.current;
        const newRotation = initialAngleRef.current + angleDelta;

        rotateShape(selectedEntityIds[0], newRotation);
      } else if (
        isResizing &&
        initialResizeDataRef.current &&
        selectedEntityIds.length === 1
      ) {
        // Implement resize for 's', 'e', and 'se' without rotation handling
        const { width, height, mouseX, mouseY, handle } =
          initialResizeDataRef.current;

        // Convert screen-space movement to world-space based on zoom
        const deltaClientX = e.clientX - mouseX;
        const deltaClientY = e.clientY - mouseY;
        const worldDeltaX = deltaClientX / viewport.zoom;
        const worldDeltaY = deltaClientY / viewport.zoom;

        let newWidth = width;
        let newHeight = height;
        let deltaX = 0;
        let deltaY = 0;

        if (handle === 'e') {
          newWidth = width + worldDeltaX;
        } else if (handle === 's') {
          newHeight = height + worldDeltaY;
        } else if (handle === 'se') {
          newWidth = width + worldDeltaX;
          newHeight = height + worldDeltaY;
        } else {
          // Other handles not handled here
          return;
        }

        // Apply the resize. For east/south edges, top-left stays fixed (deltaX/Y = 0)
        resizeShape(selectedEntityIds[0], newWidth, newHeight, deltaX, deltaY);
      }
    };

    const handleMouseUp = () => {
      setIsRotating(false);
      setIsResizing(false);
      initialResizeDataRef.current = null;
    };

    if (isRotating || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isRotating,
    isResizing,
    selectedEntityIds,
    rotateShape,
    resizeShape,
    setIsRotating,
    setIsResizing,
    viewport.zoom,
  ]);

  const handles = [
    { key: 'nw', x: x - half, y: y - half },
    { key: 'n', x: cx - half, y: y - half },
    { key: 'ne', x: x + width - half, y: y - half },
    { key: 'w', x: x - half, y: cy - half },
    { key: 'e', x: x + width - half, y: cy - half },
    { key: 'sw', x: x - half, y: y + height - half },
    { key: 's', x: cx - half, y: y + height - half },
    { key: 'se', x: x + width - half, y: y + height - half },
  ];

  return (
    <g
      pointerEvents="none"
      ref={handleContainerRef}
      transform={`translate(${cx}, ${cy}) rotate(${rotation}) translate(${-cx}, ${-cy})`}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1}
        strokeDasharray="4,4"
      />
      {handles.map(h => (
        <rect
          onMouseDown={e => {
            e.stopPropagation();
            e.preventDefault();
            if (selectedEntityIds.length === 1) {
              initialResizeDataRef.current = {
                x,
                y,
                width,
                height,
                mouseX: e.clientX,
                mouseY: e.clientY,
                handle: h.key,
                rotation,
              };
              setIsResizing(true);
            }
          }}
          key={h.key}
          x={h.x}
          y={h.y}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#ffffff"
          stroke="#3b82f6"
          strokeWidth={1}
          pointerEvents="all"
          style={{ cursor: `${h.key}-resize` as any }}
          data-resize-handle="true"
        />
      ))}
      {/* Rotate handle above top-center */}
      <line
        x1={cx}
        y1={y - 16}
        x2={cx}
        y2={y}
        stroke="#3b82f6"
        strokeWidth={1}
      />
      <circle
        onMouseDown={e => {
          e.stopPropagation();
          if (handleContainerRef.current && selectedEntityIds.length === 1) {
            const rect = handleContainerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Store initial values
            initialAngleRef.current = rotation;
            initialMouseAngleRef.current =
              (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) /
              Math.PI;

            setIsRotating(true);
          }
        }}
        cx={cx}
        cy={y - 16}
        r={6}
        fill="#ffffff"
        stroke="#3b82f6"
        strokeWidth={1}
        pointerEvents="all"
        style={{ cursor: 'grab' }}
        data-resize-handle="true"
      />
    </g>
  );
};
