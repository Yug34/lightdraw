import { useCanvasStore } from '@/store/canvasStore';
import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === e.key.toLowerCase() &&
          !!shortcut.ctrlKey === e.ctrlKey &&
          !!shortcut.metaKey === e.metaKey &&
          !!shortcut.shiftKey === e.shiftKey &&
          !!shortcut.altKey === e.altKey
        );
      });

      if (matchingShortcut) {
        e.preventDefault();
        e.stopPropagation();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Predefined shortcuts for canvas operations
export const useCanvasKeyboardShortcuts = () => {
  const { selectedEntityIds, deleteEntity, setToolMode, clearToolMode } =
    useCanvasStore();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'Delete',
      action: () => selectedEntityIds.forEach(id => deleteEntity(id)),
      description: 'Delete selected shapes',
    },
    {
      key: 'Backspace',
      action: () => selectedEntityIds.forEach(id => deleteEntity(id)),
      description: 'Delete selected shapes',
    },
    {
      key: 'Escape',
      action: clearToolMode,
      description: 'Clear tool selection',
    },
    {
      key: 'r',
      action: () => setToolMode('rectangle'),
      description: 'Select rectangle tool',
    },
    {
      key: 'c',
      action: () => setToolMode('circle'),
      description: 'Select circle tool',
    },
    {
      key: 't',
      action: () => setToolMode('text'),
      description: 'Select text tool',
    },
    {
      key: 'v',
      action: () => setToolMode('none'),
      description: 'Select selection tool',
    },
  ];

  useKeyboardShortcuts(shortcuts);
};
