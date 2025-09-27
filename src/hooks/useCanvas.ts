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
  const [isDraggingEntity, setIsDraggingEntity] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartSnapshotRef = useRef<{
    shapes: typeof shapes;
    connectors: typeof connectors;
    groups: typeof groups;
  } | null>(null);
  const initialMouseWorldRef = useRef<{ x: number; y: number } | null>(null);
  const initialEntityPositionsRef = useRef<
    Record<string, { x: number; y: number; targetX?: number; targetY?: number }>
  >({});
  const initialGroupPositionsRef = useRef<
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
    groups,
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
    updateConnector,
    updateGroup,
    pushHistorySnapshot,
    placeShapeAtPosition,
    placeConnectorAtPosition,
    setPendingConnectorStart,
    rotateShape,
    resizeShape,
    theme,
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

  const handleEntityMouseDown = useCallback(
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

      // Check if the entity is part of a group
      const containingGroup = groups.find(group => group.id === entityId);

      // Determine which entities to drag
      let idsToDrag: string[];
      if (containingGroup) {
        // If entity is in a group, drag all entities in that group
        idsToDrag = containingGroup.entityIds;
      } else {
        // Otherwise, drag selected entities or just the clicked entity
        idsToDrag = selectedEntityIds.includes(entityId)
          ? selectedEntityIds
          : [entityId];
      }

      // snapshot initial positions for both shapes and connectors
      const pos: Record<
        string,
        { x: number; y: number; targetX?: number; targetY?: number }
      > = {};

      // Handle shapes
      (shapes || []).forEach(s => {
        if (idsToDrag.includes(s.id)) pos[s.id] = { x: s.x, y: s.y };
      });

      // Handle connectors
      (connectors || []).forEach(c => {
        if (idsToDrag.includes(c.id))
          pos[c.id] = {
            x: c.x,
            y: c.y,
            targetX: c.targetX,
            targetY: c.targetY,
          };
      });

      // Handle groups - store initial positions for groups that contain dragged entities
      const groupPos: Record<string, { x: number; y: number }> = {};
      if (containingGroup) {
        groupPos[containingGroup.id] = {
          x: containingGroup.x,
          y: containingGroup.y,
        };
      }

      initialEntityPositionsRef.current = pos;
      initialGroupPositionsRef.current = groupPos;
      // capture starting snapshot for undo once drag ends
      dragStartSnapshotRef.current = {
        shapes: (shapes || []).map(s => ({ ...s })),
        connectors: (connectors || []).map(c => ({ ...c })),
        groups: (groups || []).map(g => ({ ...g })),
      };
      setIsDraggingEntity(true);
    },
    [
      isRotating,
      isResizing,
      selectedEntityIds,
      viewport.x,
      viewport.y,
      viewport.zoom,
      shapes,
      connectors,
      groups,
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
      if (isDraggingEntity && initialMouseWorldRef.current) {
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

        const ids = Object.keys(initialEntityPositionsRef.current || {});
        ids.forEach(id => {
          const startPos = initialEntityPositionsRef.current[id];
          if (!startPos) return;

          if (
            startPos.targetX !== undefined &&
            startPos.targetY !== undefined
          ) {
            updateConnector(
              id,
              {
                x: startPos.x + dx,
                y: startPos.y + dy,
                targetX: startPos.targetX + dx,
                targetY: startPos.targetY + dy,
              },
              { recordHistory: false }
            );
          } else {
            updateShape(
              id,
              { x: startPos.x + dx, y: startPos.y + dy },
              { recordHistory: false }
            );
          }
        });

        // Update group positions
        const groupIds = Object.keys(initialGroupPositionsRef.current || {});
        groupIds.forEach(groupId => {
          const startPos = initialGroupPositionsRef.current[groupId];
          if (!startPos) return;

          updateGroup(
            groupId,
            { x: startPos.x + dx, y: startPos.y + dy },
            { recordHistory: false }
          );
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
      isDraggingEntity,
      viewport.x,
      viewport.y,
      updateShape,
      updateConnector,
      updateGroup,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (isDraggingEntity) {
      setIsDraggingEntity(false);
      // on drag end, push a single snapshot of the starting state
      if (dragStartSnapshotRef.current) {
        pushHistorySnapshot({
          shapes: dragStartSnapshotRef.current.shapes as any,
          connectors: dragStartSnapshotRef.current.connectors as any,
          groups: dragStartSnapshotRef.current.groups as any,
        });
        dragStartSnapshotRef.current = null;
      }
      initialMouseWorldRef.current = null;
      initialMouseClientRef.current = null;
      initialEntityPositionsRef.current = {};
      initialGroupPositionsRef.current = {};
      dragInitiatedRef.current = false;
    }
  }, [isDraggingEntity]);

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

  const updateShapeColor = useCallback(
    (id: string, color: string) => {
      updateShape(id, { fill: color, stroke: color });
    },
    [updateShape]
  );
  const updateConnectorColor = useCallback(
    (id: string, color: string) => {
      updateConnector(id, { stroke: color });
    },
    [updateConnector]
  );

  return {
    svgRef,
    isDragging,
    isDraggingEntity,
    viewport,
    canvasSize,
    shapes,
    connectors,
    groups,
    selectedEntityIds,
    toolMode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleShapeClick,
    handleEntityMouseDown,
    isRotating,
    setIsRotating,
    isResizing,
    setIsResizing,
    rotateShape,
    resizeShape,
    theme,
    updateShapeColor,
    updateConnectorColor,
  };
};
