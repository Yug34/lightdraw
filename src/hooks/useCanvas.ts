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
    connectors,
    selectedEntityIds,
    toolMode,
    pendingConnectorStart,
    setViewport,
    setViewportZoom,
    setCanvasSize,
    selectEntity,
    selectEntities,
    clearSelection,
    placeShapeAtPosition,
    placeConnectorAtPosition,
    setPendingConnectorStart,
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

  // Handle zoom and pan with wheel events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && enableZoom) {
        // Handle zoom with Ctrl+wheel
        e.preventDefault();
        e.stopPropagation();

        const newZoom = Math.max(
          0.5,
          Math.min(2, viewport.zoom - e.deltaY / 1000)
        );

        setViewportZoom(newZoom);
      } else if (enablePan) {
        // Handle pan with wheel
        e.preventDefault();
        e.stopPropagation();

        const panSpeed = 0.3;
        const deltaY = (e.deltaY * panSpeed) / viewport.zoom;
        const deltaX = (e.deltaX * panSpeed) / viewport.zoom;

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
    };

    document.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [viewport, enableZoom, enablePan, setViewportZoom, setViewport]);

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

            if (toolMode === 'arrow') {
              if (!pendingConnectorStart) {
                setPendingConnectorStart({ x: worldX, y: worldY });
              } else {
                placeConnectorAtPosition(
                  pendingConnectorStart.x,
                  pendingConnectorStart.y,
                  worldX,
                  worldY
                );
                setPendingConnectorStart(null);
              }
            } else {
              placeShapeAtPosition(worldX, worldY);
            }
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
      placeConnectorAtPosition,
      pendingConnectorStart,
      setPendingConnectorStart,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && enablePan) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Convert screen-space movement to world-space based on zoom
        const worldDeltaX = deltaX / viewport.zoom;
        const worldDeltaY = deltaY / viewport.zoom;

        setViewport({ x: lastPan.x - worldDeltaX, y: lastPan.y - worldDeltaY });
      }
    },
    [isDragging, dragStart, lastPan, enablePan, setViewport, viewport.zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleShapeClick = useCallback(
    (e: React.MouseEvent, entityId: string) => {
      if (!enableSelection) return;

      e.stopPropagation();

      // multi select
      if (e.ctrlKey || e.metaKey) {
        if (selectedEntityIds.includes(entityId)) {
          const newSelection = selectedEntityIds.filter(id => id !== entityId);
          selectEntities(newSelection);
        } else {
          selectEntities([...selectedEntityIds, entityId]);
        }
      } else {
        selectEntity(entityId);
      }
    },
    [selectEntity, selectEntities, selectedEntityIds, enableSelection]
  );

  return {
    svgRef,
    isDragging,
    viewport,
    canvasSize,
    shapes,
    connectors,
    selectedEntityIds,
    toolMode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleShapeClick,
  };
};
