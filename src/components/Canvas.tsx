import { Toolbar } from '@/components/Toolbar';
import { GridBackground } from '@/components/canvas/GridBackground';
import { ShapeRenderer } from '@/components/canvas/ShapeRenderer';
import { useCanvas } from '@/hooks';
import { useCanvasStore } from '@/store/canvasStore';
import type { Connector, Shape, Group } from '@/store/canvasStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
  CanvasSidebar,
  CanvasSidebarTrigger,
} from '@/components/canvas/CanvasSidebar';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface CanvasProps {}

export const Canvas: React.FC<CanvasProps> = () => {
  const { theme } = useCanvasStore();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('sidebar:open');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebar:open', String(sidebarOpen));
    } catch {}
  }, [sidebarOpen]);

  const {
    svgRef,
    viewport,
    canvasSize,
    shapes,
    connectors,
    groups,
    selectedEntityIds,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleShapeClick,
    handleEntityMouseDown,
  } = useCanvas();

  const { loadPersistedState } = useCanvasStore();

  useEffect(() => {
    // Load persisted state on mount
    loadPersistedState();
  }, [loadPersistedState]);

  const renderShape = (shape: Shape) => {
    const isSelected = selectedEntityIds.includes(shape.id);
    return (
      <ShapeRenderer
        key={shape.id}
        entity={shape}
        isSelected={isSelected}
        onClick={handleShapeClick}
        onMouseDown={handleEntityMouseDown}
        type="shape"
      />
    );
  };

  const renderConnector = (connector: Connector) => {
    const isSelected = selectedEntityIds.includes(connector.id);
    return (
      <ShapeRenderer
        key={connector.id}
        entity={connector}
        isSelected={isSelected}
        onClick={handleShapeClick}
        onMouseDown={handleEntityMouseDown}
        type="connector"
      />
    );
  };

  const renderGroup = (group: Group) => {
    const isSelected = selectedEntityIds.includes(group.id);
    return (
      <g key={group.id}>
        {/* Group bounding box */}
        <rect
          x={group.x}
          y={group.y}
          width={group.width}
          height={group.height}
          fill={group.fill || 'transparent'}
          stroke={group.stroke || '#3b82f6'}
          strokeWidth={group.strokeWidth || 2}
          strokeDasharray="5,5"
          opacity={group.opacity || 0.8}
          style={{
            cursor: 'pointer',
            filter: isSelected
              ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
              : 'none',
          }}
          onClick={e => handleShapeClick(e, group.id)}
          onMouseDown={e =>
            handleEntityMouseDown && handleEntityMouseDown(e, group.id)
          }
        />
        {/* Group name label */}
        {group.name && (
          <text
            x={group.x + 5}
            y={group.y - 5}
            fontSize="12"
            fill={group.stroke || '#3b82f6'}
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            {group.name}
          </text>
        )}
      </g>
    );
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <CanvasSidebar />
      <div
        className={cn(
          'relative overflow-hidden w-full h-full',
          theme === 'dark' ? 'bg-slate-900' : 'bg-white'
        )}
      >
        <svg
          className={cn(
            'w-screen h-screen',
            theme === 'dark' ? 'text-white' : 'text-black'
          )}
          ref={svgRef}
          viewBox={`${viewport.x} ${viewport.y} ${canvasSize.width / viewport.zoom} ${canvasSize.height / viewport.zoom}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            background: theme === 'dark' ? '#0b1220' : '#f8fafc',
          }}
        >
          <GridBackground />
          <rect
            x={viewport.x - canvasSize.width}
            y={viewport.y - canvasSize.height}
            width={canvasSize.width * 3}
            height={canvasSize.height * 3}
            fill="url(#grid)"
          />

          {(shapes ?? []).map(renderShape)}
          {(connectors ?? []).map(renderConnector)}
          {(groups ?? []).map(renderGroup)}
        </svg>

        <Toolbar />
        {/* <CanvasInfo /> */}
        <CanvasSidebarTrigger />
      </div>
    </SidebarProvider>
  );
};
