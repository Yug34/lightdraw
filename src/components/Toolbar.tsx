import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/store/canvasStore';
import React from 'react';

export const Toolbar: React.FC = () => {
  const { addShape, shapes, deleteShape, selectedShapeIds } = useCanvasStore();

  const addRectangle = () => {
    addShape({
      type: 'rectangle',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 120,
      height: 80,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
    });
  };

  const addCircle = () => {
    addShape({
      type: 'circle',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 100,
      height: 100,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
    });
  };

  const addText = () => {
    addShape({
      type: 'text',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 150,
      height: 40,
      fill: '#374151',
      stroke: '#6b7280',
      strokeWidth: 1,
      text: 'Hello World',
      fontSize: 16,
    });
  };

  const deleteSelected = () => {
    selectedShapeIds.forEach(id => deleteShape(id));
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Shapes:</span>
          <Button
            onClick={addRectangle}
            variant="outline"
            size="sm"
            className="h-8"
          >
            Rectangle
          </Button>
          <Button
            onClick={addCircle}
            variant="outline"
            size="sm"
            className="h-8"
          >
            Circle
          </Button>
          <Button onClick={addText} variant="outline" size="sm" className="h-8">
            Text
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Actions:</span>
          <Button
            onClick={deleteSelected}
            variant="outline"
            size="sm"
            className="h-8"
            disabled={selectedShapeIds.length === 0}
          >
            Delete ({selectedShapeIds.length})
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="text-sm text-gray-500">
          Total shapes: {shapes.length}
        </div>
      </div>
    </div>
  );
};
