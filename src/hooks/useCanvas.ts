import { useCanvasStore } from '@/store/canvasStore';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCanvasOptions {
  enablePan?: boolean;
  enableZoom?: boolean;
  enableSelection?: boolean;
}

export const useCanvas = (options: UseCanvasOptions = {}) => {
  const {
    enablePan = true,
    enableZoom = true,
    enableSelection = true,
  } = options;

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
    selectShapes,
    clearSelection,
    placeShapeAtPosition,
  } = useCanvasStore();

  // Update canvas size on mount and resize
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

  // Handle zoom with Ctrl+wheel
  useEffect(() => {
    if (!enableZoom) return;

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
  }, [viewport, enableZoom, setViewportZoom]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 && enablePan) {
        // Middle mouse button
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setLastPan({ x: viewport.x, y: viewport.y });
        e.preventDefault();
      } else if (e.button === 0 && e.metaKey && enablePan) {
        // Cmd+click
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setLastPan({ x: viewport.x, y: viewport.y });
        e.preventDefault();
      } else if (e.button === 0) {
        // Left click
        if (toolMode !== 'none') {
          // Convert screen coordinates to world coordinates
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            // Convert to world coordinates by accounting for viewport offset and zoom
            const worldX = viewport.x + screenX / viewport.zoom;
            const worldY = viewport.y + screenY / viewport.zoom;

            placeShapeAtPosition(worldX, worldY);
          }
        } else if (enableSelection) {
          // Only clear selection if not holding Ctrl/Cmd (for multi-selection)
          if (!e.ctrlKey && !e.metaKey) {
            clearSelection();
          }
        }
      }
    },
    [
      viewport,
      toolMode,
      enablePan,
      enableSelection,
      clearSelection,
      placeShapeAtPosition,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && enablePan) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setViewport({ x: lastPan.x - deltaX, y: lastPan.y - deltaY });
      }
    },
    [isDragging, dragStart, lastPan, enablePan, setViewport]
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
      } else if (enablePan) {
        const panSpeed = 0.3;
        const deltaY = e.deltaY * panSpeed;
        const deltaX = e.deltaX * panSpeed;

        // Handle Shift+mousewheel for horizontal panning (keyboard modifier)
        if (e.shiftKey) {
          // Shift+vertical scroll for horizontal panning
          setViewport({ x: viewport.x + deltaY, y: viewport.y });
        } else if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
          // Touchpad gesture detected - handle both horizontal and vertical movement
          const newX = viewport.x + deltaX;
          const newY = viewport.y + deltaY;
          setViewport({ x: newX, y: newY });
        } else {
          // Regular vertical scrolling (fallback for mouse wheel)
          setViewport({ x: viewport.x, y: viewport.y + deltaY });
        }
      }
    },
    [viewport, enablePan, setViewport]
  );

  const handleShapeClick = useCallback(
    (e: React.MouseEvent, shapeId: string) => {
      if (!enableSelection) return;

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
    [selectShape, selectShapes, selectedShapeIds, enableSelection]
  );

  return {
    svgRef,
    isDragging,
    viewport,
    canvasSize,
    shapes,
    selectedShapeIds,
    toolMode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleShapeClick,
  };
};
