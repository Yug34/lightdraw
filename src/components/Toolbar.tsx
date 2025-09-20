import { Button } from '@/components/ui/button';
import { capitalize } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvasStore';
import React from 'react';

export const Toolbar: React.FC = () => {
  const { shapes, deleteShape, selectedShapeIds, toolMode, setToolMode } =
    useCanvasStore();

  const selectRectangleTool = () => setToolMode('rectangle');
  const selectCircleTool = () => setToolMode('circle');
  const selectTextTool = () => setToolMode('text');
  const selectNoneTool = () => setToolMode('none');
  const deleteSelected = () => selectedShapeIds.forEach(id => deleteShape(id));

  const editModeButtons = [
    {
      label: 'rectangle',
      onClick: selectRectangleTool,
    },
    {
      label: 'circle',
      onClick: selectCircleTool,
    },
    {
      label: 'text',
      onClick: selectTextTool,
    },
    {
      label: 'select',
      onClick: selectNoneTool,
    },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Shapes:</span>
          {editModeButtons.map(button => (
            <Button
              onClick={button.onClick}
              variant={toolMode === button.label ? 'default' : 'outline'}
              size="sm"
              className="h-8"
            >
              {capitalize(button.label)}
            </Button>
          ))}
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
