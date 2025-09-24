import { Toolbar } from '@/components/Toolbar';
import { CanvasInfo } from '@/components/canvas/CanvasInfo';
import { GridBackground } from '@/components/canvas/GridBackground';
import { ShapeRenderer } from '@/components/canvas/ShapeRenderer';
import { useCanvas } from '@/hooks';
import { useCanvasStore } from '@/store/canvasStore';
import type { Connector, Shape } from '@/store/canvasStore';
import React from 'react';

interface CanvasProps {}

export const Canvas: React.FC<CanvasProps> = () => {
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
        type="connector"
      />
    );
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
        style={{
          background: '#f8fafc',
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
      <CanvasInfo />
    </div>
  );
};
