import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/store/canvasStore';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export const CanvasSidebarTrigger = () => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      className="cursor-pointer absolute top-1/2 -translate-y-1/2 z-[100] bg-white border border-gray-200 border-l-none"
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
    >
      {state === 'expanded' ? (
        <ChevronLeftIcon className="w-4 h-4 cursor-pointer" />
      ) : (
        <ChevronRightIcon className="w-4 h-4 cursor-pointer" />
      )}
    </Button>
  );
};

export const CanvasSidebar = () => {
  const { shapes, connectors, selectedEntityIds } = useCanvasStore();

  const selectedId = selectedEntityIds[0];
  const selectedShape = (shapes || []).find(s => s.id === selectedId);
  const selectedConnector = (connectors || []).find(c => c.id === selectedId);

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Selection</SidebarGroupLabel>
          <SidebarGroupContent>
            {selectedEntityIds.length === 0 && (
              <div className="text-sm text-muted-foreground px-1 py-1">
                No selection. Click a shape to see details.
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
                      value={selectedShape.type}
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
                        value={selectedConnector.type}
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};
