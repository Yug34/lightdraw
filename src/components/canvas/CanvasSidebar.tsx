import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/store/canvasStore';
import { ChevronLeftIcon, ChevronRightIcon, Sun, Moon } from 'lucide-react';
import ColorPicker from '@/components/ColorPicker';
import { capitalize } from '@/lib/utils';

export const CanvasSidebarTrigger = () => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      className="w-6 h-12"
      variant="sidebarTrigger"
      onClick={toggleSidebar}
    >
      {state === 'expanded' ? (
        <ChevronLeftIcon className="w-6 h-6 cursor-pointer" />
      ) : (
        <ChevronRightIcon className="w-6 h-6 cursor-pointer" />
      )}
    </Button>
  );
};

export const CanvasSidebar = () => {
  const { shapes, connectors, groups, selectedEntityIds, theme, setTheme } =
    useCanvasStore();

  const selectedId = selectedEntityIds[0];
  const selectedGroup = (groups || []).find(g => g.id === selectedId);
  const selectedShape = (shapes || []).find(s => s.id === selectedId);
  const selectedConnector = (connectors || []).find(c => c.id === selectedId);

  return (
    <Sidebar>
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="flex-1 min-h-0 flex flex-col gap-y-4">
          <SidebarGroupContent className="p-2">
            {selectedEntityIds.length === 0 && (
              <div className="space-y-3 px-1 py-1">
                <div className="text-sm text-muted-foreground">
                  No selection. Click a shape to see details.
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium">Canvas Theme</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                    aria-label={'Toggle Theme'}
                    onClick={() => {
                      if (theme === 'light') {
                        setTheme('dark');
                      } else {
                        setTheme('light');
                      }
                    }}
                  >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </div>
              </div>
            )}

            {selectedEntityIds.length > 1 && (
              <div className="text-sm px-1 py-1">
                {selectedEntityIds.length} items selected
              </div>
            )}

            {selectedEntityIds.length === 1 && selectedShape && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Shape</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label htmlFor="shape-type">Type</Label>
                    <Input
                      id="shape-type"
                      value={capitalize(selectedShape.type)}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape-x">X</Label>
                    <Input
                      id="shape-x"
                      value={Math.round(selectedShape.x)}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape-y">Y</Label>
                    <Input
                      id="shape-y"
                      value={Math.round(selectedShape.y)}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape-w">Width</Label>
                    <Input
                      id="shape-w"
                      value={Math.round(selectedShape.width)}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape-h">Height</Label>
                    <Input
                      id="shape-h"
                      value={Math.round(selectedShape.height)}
                      readOnly
                    />
                  </div>
                  {typeof selectedShape.rotation === 'number' && (
                    <div className="col-span-2">
                      <Label htmlFor="shape-rot">Rotation</Label>
                      <Input
                        id="shape-rot"
                        value={`${Math.round(selectedShape.rotation)}°`}
                        readOnly
                      />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="shape-fill">Fill</Label>
                    <Input
                      id="shape-fill"
                      value={selectedShape.fill || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape-stroke">Stroke</Label>
                    <Input
                      id="shape-stroke"
                      value={selectedShape.stroke || ''}
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="shape-strokeWidth">Stroke Width</Label>
                    <Input
                      id="shape-strokeWidth"
                      value={selectedShape.strokeWidth ?? ''}
                      readOnly
                    />
                  </div>
                </div>
                {selectedShape.type === 'text' && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <Label htmlFor="shape-text">Text</Label>
                        <Input
                          id="shape-text"
                          value={selectedShape.text || ''}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label htmlFor="shape-font-size">Font Size</Label>
                        <Input
                          id="shape-font-size"
                          value={selectedShape.fontSize ?? ''}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label htmlFor="shape-font-family">Font Family</Label>
                        <Input
                          id="shape-font-family"
                          value={selectedShape.fontFamily || ''}
                          readOnly
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedEntityIds.length === 1 &&
              !selectedShape &&
              selectedConnector && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Connector</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label htmlFor="conn-type">Type</Label>
                      <Input
                        id="conn-type"
                        value={capitalize(selectedConnector.type)}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="conn-x">X</Label>
                      <Input
                        id="conn-x"
                        value={Math.round(selectedConnector.x)}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="conn-y">Y</Label>
                      <Input
                        id="conn-y"
                        value={Math.round(selectedConnector.y)}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="conn-tx">Target X</Label>
                      <Input
                        id="conn-tx"
                        value={Math.round(selectedConnector.targetX)}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="conn-ty">Target Y</Label>
                      <Input
                        id="conn-ty"
                        value={Math.round(selectedConnector.targetY)}
                        readOnly
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="conn-stroke">Stroke</Label>
                      <Input
                        id="conn-stroke"
                        value={selectedConnector.stroke || ''}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="conn-strokeWidth">Stroke Width</Label>
                      <Input
                        id="conn-strokeWidth"
                        value={selectedConnector.strokeWidth ?? ''}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

            {selectedEntityIds.length === 1 && selectedGroup && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Group</div>
                <div>
                  <Label htmlFor="group-name">Name</Label>
                  <Input
                    id="group-name"
                    value={selectedGroup?.name || ''}
                    readOnly
                  />
                </div>
              </div>
            )}
          </SidebarGroupContent>
          <ColorPicker />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
