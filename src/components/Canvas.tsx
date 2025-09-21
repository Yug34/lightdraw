import { Toolbar } from '@/components/Toolbar';
import { CanvasInfo } from '@/components/canvas/CanvasInfo';
import { GridBackground } from '@/components/canvas/GridBackground';
import { ShapeRenderer } from '@/components/canvas/ShapeRenderer';
import { useCanvas } from '@/hooks';
import { useCanvasStore } from '@/store/canvasStore';
import React from 'react';

interface CanvasProps {}

export const Canvas: React.FC<CanvasProps> = () => {
  const {
    svgRef,
    viewport,
    canvasSize,
    shapes,
    selectedShapeIds,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleShapeClick,
  } = useCanvas();

  const { loadPersistedState } = useCanvasStore();

  React.useEffect(() => {
    // Load persisted state on mount
    loadPersistedState();
  }, [loadPersistedState]);

  const renderShape = (shape: any) => {
    const isSelected = selectedShapeIds.includes(shape.id);
    return (
      <ShapeRenderer
        key={shape.id}
        shape={shape}
        isSelected={isSelected}
        onClick={handleShapeClick}
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
        onWheel={handleWheel}
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

        {shapes.map(renderShape)}
      </svg>

      <Toolbar />
      <CanvasInfo />
    </div>
  );
};
