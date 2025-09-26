import { Toolbar } from '@/components/Toolbar';
import { GridBackground } from '@/components/canvas/GridBackground';
import { ShapeRenderer } from '@/components/canvas/ShapeRenderer';
import { useCanvas } from '@/hooks';
import { useCanvasStore } from '@/store/canvasStore';
import type { Connector, Shape } from '@/store/canvasStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
  CanvasSidebar,
  CanvasSidebarTrigger,
} from '@/components/canvas/CanvasSidebar';
import React from 'react';
import { cn } from '@/lib/utils';

interface CanvasProps {}

export const Canvas: React.FC<CanvasProps> = () => {
  const { theme } = useCanvasStore();
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('sidebar:open');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  React.useEffect(() => {
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
    selectedEntityIds,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleShapeClick,
    handleEntityMouseDown,
  } = useCanvas();

  const { loadPersistedState } = useCanvasStore();

  React.useEffect(() => {
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
        </svg>

        <Toolbar />
        {/* <CanvasInfo /> */}
        <CanvasSidebarTrigger />
      </div>
    </SidebarProvider>
  );
};
