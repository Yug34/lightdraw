import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/store/canvasStore';
import React from 'react';

export const Header: React.FC = () => {
  const { clearPersistedState } = useCanvasStore();

  const handleNewProject = () => {
    if (
      confirm(
        'Are you sure you want to create a new project? This will clear all current work.'
      )
    ) {
      clearPersistedState();
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-999 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">LightDraw</h1>
          <span className="text-sm text-gray-500">
            Figma-inspired design tool
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Button onClick={handleNewProject} variant="outline" size="sm">
            New Project
          </Button>

          <div className="text-xs text-gray-500">
            <div>Press R, C, T for tools</div>
            <div>ESC to deselect</div>
          </div>
        </div>
      </div>
    </header>
  );
};
