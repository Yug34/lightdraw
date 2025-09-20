import { Toolbar } from '@/components/Toolbar';
import { useCanvasStore, type Shape } from '@/store/canvasStore';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CanvasProps {
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });

  const {
    viewport,
    canvasSize,
    shapes,
    selectedShapeIds,
    toolMode,
    setViewport,
    setViewportZoom,
    setCanvasSize,
    selectShape,
    clearSelection,
    placeShapeAtPosition,
  } = useCanvasStore();

  useEffect(() => {
    const updateCanvasSize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [setCanvasSize]);

  useEffect(() => {
    const handleZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();

        const newZoom = Math.max(
          0.5,
          Math.min(2, viewport.zoom - e.deltaY / 1000)
        );

        setViewportZoom(newZoom);
      }
    };

    document.addEventListener('wheel', handleZoom, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener('wheel', handleZoom, { capture: true });
    };
  }, [viewport]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.metaKey)) {
        // Middle mouse or Cmd+click
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setLastPan({ x: viewport.x, y: viewport.y });
        e.preventDefault();
      } else if (e.button === 0) {
        // Left click
        if (toolMode !== 'none') {
          // Convert screen coordinates to canvas coordinates
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            const canvasX =
              (e.clientX - rect.left) / viewport.zoom + viewport.x;
            const canvasY = (e.clientY - rect.top) / viewport.zoom + viewport.y;
            placeShapeAtPosition(canvasX, canvasY);
          }
        } else {
          clearSelection();
        }
      }
    },
    [viewport, toolMode, clearSelection, placeShapeAtPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setViewport({
          x: lastPan.x - deltaX,
          y: lastPan.y - deltaY,
        });
      }
    },
    [isDragging, dragStart, lastPan, setViewport]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey) {
        return;
      } else {
        const panSpeed = 0.3;
        const deltaY = e.deltaY * panSpeed;

        if (e.shiftKey) {
          setViewport({
            x: viewport.x + deltaY,
            y: viewport.y,
          });
        } else {
          setViewport({
            x: viewport.x,
            y: viewport.y + deltaY,
          });
        }
      }
    },
    [viewport, setViewport]
  );

  const handleShapeClick = useCallback(
    (e: React.MouseEvent, shapeId: string) => {
      e.stopPropagation();
      selectShape(shapeId);
    },
    [selectShape]
  );

  const renderShape = (shape: Shape) => {
    const isSelected = selectedShapeIds.includes(shape.id);
    const commonProps = {
      onClick: (e: React.MouseEvent) => handleShapeClick(e, shape.id),
      style: {
        cursor: 'pointer',
        filter: isSelected
          ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
          : 'none',
      },
    };

    switch (shape.type) {
      case 'rectangle':
        return (
          <rect
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            {...commonProps}
          />
        );

      case 'circle':
        const radius = Math.min(shape.width, shape.height) / 2;
        return (
          <circle
            key={shape.id}
            cx={shape.x + radius}
            cy={shape.y + radius}
            r={radius}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            {...commonProps}
          />
        );

      case 'text':
        return (
          <g key={shape.id} {...commonProps}>
            <rect
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill="transparent"
              stroke={isSelected ? shape.stroke : 'transparent'}
              strokeWidth={shape.strokeWidth}
              strokeDasharray={isSelected ? '5,5' : 'none'}
            />
            <text
              x={shape.x + 8}
              y={shape.y + shape.height / 2 + 4}
              fontSize={shape.fontSize}
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

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        className="w-screen h-screen"
        ref={svgRef}
        viewBox={`${viewport.x} ${viewport.y} ${canvasSize.width / viewport.zoom} ${canvasSize.height / viewport.zoom}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: isDragging
            ? 'grabbing'
            : toolMode !== 'none'
              ? 'crosshair'
              : 'grab',
          background: '#f8fafc',
        }}
      >
        {/* Grid background */}
        <defs>
          <pattern
            id="grid"
            width={20 * viewport.zoom}
            height={20 * viewport.zoom}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${20 * viewport.zoom} 0 L 0 0 0 ${20 * viewport.zoom}`}
              fill="none"
              stroke="#00ff00"
              strokeWidth={0.5}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {shapes.map(renderShape)}
      </svg>

      <Toolbar />

      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
        <div>Zoom: {Math.round(viewport.zoom * 100)}%</div>
        <div>Shapes: {shapes.length}</div>
        <div>Selected: {selectedShapeIds.length}</div>
        <div>
          Tool:{' '}
          {toolMode === 'none'
            ? 'Select'
            : toolMode.charAt(0).toUpperCase() + toolMode.slice(1)}
        </div>
      </div>
    </div>
  );
};
