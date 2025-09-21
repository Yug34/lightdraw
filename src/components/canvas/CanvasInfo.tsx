import { useCanvasStore } from '@/store/canvasStore';
import React from 'react';

export const CanvasInfo: React.FC = () => {
  const { viewport, shapes, selectedShapeIds, toolMode, isSaving } =
    useCanvasStore();

  return (
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
      {isSaving && <div className="text-blue-600 text-xs mt-1">Saving...</div>}
    </div>
  );
};
