import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { capitalize } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvasStore';
import React, { useState } from 'react';

export const Toolbar: React.FC = () => {
  const { theme } = useCanvasStore();
  const {
    shapes,
    connectors,
    groups,
    deleteEntity,
    selectedEntityIds,
    toolMode,
    setToolMode,
    clearPersistedState,
    undo,
    canUndo,
    addGroup,
    deleteGroup,
    ungroupGroup,
  } = useCanvasStore();

  // Dialog state
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');

  const selectRectangleTool = () => setToolMode('rectangle');
  const selectCircleTool = () => setToolMode('circle');
  const selectTextTool = () => setToolMode('text');
  const selectNoneTool = () => setToolMode('none');

  // Connector tools
  const selectArrowTool = () => setToolMode('arrow');
  const selectLineTool = () => setToolMode('line');
  const selectDoubleArrowTool = () => setToolMode('double-arrow');
  const selectDottedTool = () => setToolMode('dotted');
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

  // Group and ungroup functions
  const handleGroup = () => {
    if (selectedEntityIds.length < 2) {
      alert('Please select at least 2 entities to create a group.');
      return;
    }

    // Filter out any groups from the selection (groups can't be grouped)
    const entityIds = selectedEntityIds.filter(id => {
      return !groups.some(group => group.id === id);
    });

    if (entityIds.length < 2) {
      alert('Please select at least 2 non-group entities to create a group.');
      return;
    }

    setIsGroupDialogOpen(true);
  };

  const handleGroupSubmit = () => {
    const entityIds = selectedEntityIds.filter(id => {
      return !groups.some(group => group.id === id);
    });

    const finalGroupName = groupName.trim() || undefined;
    addGroup(entityIds, finalGroupName);
    setGroupName('');
    setIsGroupDialogOpen(false);
  };

  const handleGroupCancel = () => {
    setGroupName('');
    setIsGroupDialogOpen(false);
  };

  const handleUngroup = () => {
    const selectedGroups = selectedEntityIds.filter(id =>
      groups.some(group => group.id === id)
    );

    for (const groupId of selectedGroups) {
      ungroupGroup(groupId);
    }
  };

  // Check if we can group (have 2+ non-group entities selected)
  const canGroup =
    selectedEntityIds.length >= 2 &&
    selectedEntityIds.filter(id => !groups.some(group => group.id === id))
      .length >= 2;

  // Check if we can ungroup (have groups selected)
  const canUngroup = selectedEntityIds.some(id =>
    groups.some(group => group.id === id)
  );

  const shapeButtons = [
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
  ];

  const connectorButtons = [
    {
      label: '→',
      toolMode: 'arrow',
      onClick: selectArrowTool,
      title: 'Arrow',
    },
    {
      label: '—',
      toolMode: 'line',
      onClick: selectLineTool,
      title: 'Line',
    },
    {
      label: '↔',
      toolMode: 'double-arrow',
      onClick: selectDoubleArrowTool,
      title: 'Double Arrow',
    },
    {
      label: '···→',
      toolMode: 'dotted',
      onClick: selectDottedTool,
      title: 'Dotted Arrow',
    },
  ];

  return (
    <div
      className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-lg px-4 py-3 shadow-lg max-w-4xl border ${
        theme === 'dark'
          ? 'bg-slate-800 border-white/10 text-white'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm font-medium min-w-[60px] ${theme === 'dark' ? 'text-white/90' : 'text-gray-700'}`}
          >
            Shapes:
          </span>
          {shapeButtons.map(button => (
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

        <div className="flex items-center space-x-2">
          <span
            className={`text-sm font-medium min-w-[80px] ${theme === 'dark' ? 'text-white/90' : 'text-gray-700'}`}
          >
            Connectors:
          </span>
          {connectorButtons.map(button => (
            <Button
              key={button.toolMode}
              onClick={button.onClick}
              variant={toolMode === button.toolMode ? 'default' : 'outline'}
              size="sm"
              className="h-8 min-w-[40px]"
              title={button.title}
            >
              {button.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <Separator orientation="vertical" className="h-6" />
          <span
            className={`text-sm font-medium ${theme === 'dark' ? 'text-white/90' : 'text-gray-700'}`}
          >
            Actions:
          </span>
          <Button
            onClick={undo}
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!canUndo}
          >
            Undo
          </Button>
          <Button
            onClick={handleGroup}
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!canGroup}
            title="Group selected entities"
          >
            Group
          </Button>
          <Button
            onClick={handleUngroup}
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!canUngroup}
            title="Ungroup selected groups"
          >
            Ungroup
          </Button>
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
          <Separator orientation="vertical" className="h-6" />
          <div
            className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}
          >
            Total: {shapes.length + connectors.length} entities, {groups.length}{' '}
            groups
          </div>
        </div>
      </div>

      {/* Group Name Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
            <DialogDescription>
              Enter a name for the group (optional). Leave blank for an unnamed
              group.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group-name" className="text-right">
                Name
              </Label>
              <Input
                id="group-name"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="col-span-3"
                placeholder="Enter group name..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleGroupSubmit();
                  } else if (e.key === 'Escape') {
                    handleGroupCancel();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleGroupCancel}>
              Cancel
            </Button>
            <Button onClick={handleGroupSubmit}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
