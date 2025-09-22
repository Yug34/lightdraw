import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { capitalize } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvasStore';
import React from 'react';

export const Toolbar: React.FC = () => {
  const {
    shapes,
    deleteEntity,
    selectedEntityIds,
    toolMode,
    setToolMode,
    clearPersistedState,
  } = useCanvasStore();

  const selectRectangleTool = () => setToolMode('rectangle');
  const selectCircleTool = () => setToolMode('circle');
  const selectTextTool = () => setToolMode('text');
  const selectNoneTool = () => setToolMode('none');
  const selectArrowTool = () => setToolMode('arrow');
  const deleteSelected = () =>
    selectedEntityIds.forEach(id => deleteEntity(id));
  const handleClearAll = () => {
    if (
      confirm(
        'Are you sure you want to clear all shapes? This cannot be undone.'
      )
    ) {
      clearPersistedState();
    }
  };

  const editModeButtons = [
    {
      toolMode: 'rectangle',
      onClick: selectRectangleTool,
    },
    {
      toolMode: 'circle',
      onClick: selectCircleTool,
    },
    {
      toolMode: 'text',
      onClick: selectTextTool,
    },
    {
      label: 'Select',
      toolMode: 'none',
      onClick: selectNoneTool,
    },
    {
      toolMode: 'arrow',
      onClick: selectArrowTool,
    },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Shapes:</span>
          {editModeButtons.map(button => (
            <Button
              key={button.toolMode}
              onClick={button.onClick}
              variant={toolMode === button.toolMode ? 'default' : 'outline'}
              size="sm"
              className="h-8"
            >
              {button.label ?? capitalize(button.toolMode)}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Actions:</span>
          <Button
            onClick={deleteSelected}
            variant="outline"
            size="sm"
            className="h-8"
            disabled={selectedEntityIds.length === 0}
          >
            Delete ({selectedEntityIds.length})
          </Button>
          <Button
            onClick={handleClearAll}
            variant="outline"
            size="sm"
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear All
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="text-sm text-gray-500">
          Total shapes: {shapes.length}
        </div>
      </div>
    </div>
  );
};
