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
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const initialMouseWorldRef = useRef<{ x: number; y: number } | null>(null);
  const initialShapePositionsRef = useRef<
    Record<string, { x: number; y: number }>
  >({});
  const initialMouseClientRef = useRef<{ x: number; y: number } | null>(null);
  const dragInitiatedRef = useRef(false);
  const clickSuppressedRef = useRef(false);

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
    updateShape,
    placeShapeAtPosition,
    placeConnectorAtPosition,
    setPendingConnectorStart,
    rotateShape,
    resizeShape,
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
      // Check if the event target is a resize handle
      const target = e.target as Element;
      if (target && target.getAttribute('data-resize-handle')) {
        return; // Don't handle resize handle clicks
      }

      if (isRotating || isResizing) {
        return;
      } else {
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

              if (
                ['arrow', 'line', 'double-arrow', 'dotted'].includes(toolMode)
              ) {
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
      isRotating,
      isResizing,
    ]
  );

  const handleShapeMouseDown = useCallback(
    (e: React.MouseEvent, entityId: string) => {
      // ignore when resizing or rotating
      if (isRotating || isResizing) return;

      e.stopPropagation();
      e.preventDefault();

      // Prepare to possibly drag; do not change selection yet
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const worldX = viewport.x + screenX / viewport.zoom;
      const worldY = viewport.y + screenY / viewport.zoom;
      initialMouseWorldRef.current = { x: worldX, y: worldY };
      initialMouseClientRef.current = { x: e.clientX, y: e.clientY };
      dragInitiatedRef.current = false;
      clickSuppressedRef.current = false;

      // dragging all selected shapes
      const idsToDrag = selectedEntityIds.includes(entityId)
        ? selectedEntityIds
        : [entityId];

      // snapshot initial positions
      const pos: Record<string, { x: number; y: number }> = {};
      (shapes || []).forEach(s => {
        if (idsToDrag.includes(s.id)) pos[s.id] = { x: s.x, y: s.y };
      });
      initialShapePositionsRef.current = pos;
      setIsDraggingShape(true);
    },
    [
      isRotating,
      isResizing,
      selectedEntityIds,
      viewport.x,
      viewport.y,
      viewport.zoom,
      shapes,
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
      if (isDraggingShape && initialMouseWorldRef.current) {
        // drag threshold to distinguish click vs drag
        const startClient = initialMouseClientRef.current;
        if (!startClient) return;
        const pixelDx = e.clientX - startClient.x;
        const pixelDy = e.clientY - startClient.y;
        const movedPixels = Math.hypot(pixelDx, pixelDy);
        const threshold = 3;
        if (!dragInitiatedRef.current && movedPixels < threshold) {
          return;
        }
        if (!dragInitiatedRef.current) {
          dragInitiatedRef.current = true;
          clickSuppressedRef.current = true;
        }
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldX = viewport.x + screenX / viewport.zoom;
        const worldY = viewport.y + screenY / viewport.zoom;
        const dx = worldX - initialMouseWorldRef.current.x;
        const dy = worldY - initialMouseWorldRef.current.y;

        const ids = Object.keys(initialShapePositionsRef.current || {});
        ids.forEach(id => {
          const startPos = initialShapePositionsRef.current[id];
          if (!startPos) return;
          updateShape(id, { x: startPos.x + dx, y: startPos.y + dy });
        });
      }
    },
    [
      isDragging,
      dragStart,
      lastPan,
      enablePan,
      setViewport,
      viewport.zoom,
      isDraggingShape,
      viewport.x,
      viewport.y,
      updateShape,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (isDraggingShape) {
      setIsDraggingShape(false);
      initialMouseWorldRef.current = null;
      initialMouseClientRef.current = null;
      initialShapePositionsRef.current = {};
      dragInitiatedRef.current = false;
    }
  }, [isDraggingShape]);

  // Update document cursor during resize operations
  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'nw-resize';
      return () => {
        document.body.style.cursor = '';
      };
    }
  }, [isResizing]);

  const handleShapeClick = useCallback(
    (e: React.MouseEvent, entityId: string) => {
      if (!enableSelection) return;

      e.stopPropagation();
      if (clickSuppressedRef.current) {
        clickSuppressedRef.current = false;
        return;
      }

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
    isDraggingShape,
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
    handleShapeMouseDown,
    isRotating,
    setIsRotating,
    isResizing,
    setIsResizing,
    rotateShape,
    resizeShape,
  };
};
