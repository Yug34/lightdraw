import { Toolbar } from '@/components/Toolbar';
import { useCanvasStore, type Shape } from '@/store/canvasStore';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CanvasProps {}

export const Canvas: React.FC<CanvasProps> = () => {
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
    isSaving,
    setViewport,
    setViewportZoom,
    setCanvasSize,
    selectShape,
    selectShapes,
    clearSelection,
    placeShapeAtPosition,
    loadPersistedState,
  } = useCanvasStore();

  useEffect(() => {
    // Load persisted state on mount
    loadPersistedState();
  }, [loadPersistedState]);

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
      if (e.button === 1) {
        // Middle mouse button
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setLastPan({ x: viewport.x, y: viewport.y });
        e.preventDefault();
      } else if (e.button === 0 && e.metaKey) {
        // Cmd+click
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setLastPan({ x: viewport.x, y: viewport.y });
        e.preventDefault();
      } else if (e.button === 0) {
        // Left click
        if (toolMode !== 'none') {
          // Convert screen coordinates to world coordinates (stored in shape data)
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            // Convert to world coordinates by accounting for viewport offset and zoom
            const worldX = viewport.x + screenX / viewport.zoom;
            const worldY = viewport.y + screenY / viewport.zoom;

            placeShapeAtPosition(worldX, worldY);
          }
        } else {
          // Only clear selection if not holding Ctrl/Cmd (for multi-selection)
          if (!e.ctrlKey && !e.metaKey) {
            clearSelection();
          }
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

        setViewport({ x: lastPan.x - deltaX, y: lastPan.y - deltaY });
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
          setViewport({ x: viewport.x + deltaY, y: viewport.y });
        } else {
          setViewport({ x: viewport.x, y: viewport.y + deltaY });
        }
      }
    },
    [viewport, setViewport]
  );

  const handleShapeClick = useCallback(
    (e: React.MouseEvent, shapeId: string) => {
      e.stopPropagation();

      // multi select
      if (e.ctrlKey || e.metaKey) {
        if (selectedShapeIds.includes(shapeId)) {
          const newSelection = selectedShapeIds.filter(id => id !== shapeId);
          selectShapes(newSelection);
        } else {
          selectShapes([...selectedShapeIds, shapeId]);
        }
      } else {
        selectShape(shapeId);
      }
    },
    [selectShape, selectShapes, selectedShapeIds]
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

  return (
    <div className={`relative overflow-hidden w-full h-full`}>
      <svg
        className="w-screen h-screen"
        ref={svgRef}
        viewBox={`${viewport.x} ${viewport.y} ${canvasSize.width / viewport.zoom} ${canvasSize.height / viewport.zoom}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          background: '#f8fafc',
        }}
      >
        {/* Grid background */}
        <defs>
          <pattern
            id="grid"
            width={20}
            height={20}
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#000000"
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
        {isSaving && (
          <div className="text-blue-600 text-xs mt-1">Saving...</div>
        )}
      </div>
    </div>
  );
};
