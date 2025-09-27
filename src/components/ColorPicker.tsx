import {
  ColorPicker as ColorPickerBase,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@/components/ui/color-picker-base';
import { useCanvas } from '@/hooks';
import { cn } from '@/lib/utils';
import Color from 'color';
import { useCallback } from 'react';

const ColorPicker = () => {
  const {
    selectedEntityIds,
    shapes,
    connectors,
    updateShapeFillColor,
    updateShapeStrokeColor,
    updateConnectorColor,
    groups,
  } = useCanvas();

  const selectedId = selectedEntityIds[0];
  const selectedShape = (shapes || []).find(s => s.id === selectedId);
  const selectedConnector = (connectors || []).find(c => c.id === selectedId);
  const selectedGroup = (groups || []).find(g => g.id === selectedId);

  const handleShapeStrokeColorChange = useCallback(
    (c: Parameters<typeof Color.rgb>[0]) => {
      if (selectedShape) {
        updateShapeStrokeColor(selectedShape.id, Color.rgb(c).string());
      }
    },
    [selectedShape, updateShapeStrokeColor]
  );

  const handleColorChange = useCallback(
    (c: Parameters<typeof Color.rgb>[0]) => {
      if (selectedEntityIds.length === 1) {
        if (selectedShape) {
          updateShapeFillColor(selectedShape.id, Color.rgb(c).string());
        }
        if (selectedConnector) {
          updateConnectorColor(selectedConnector.id, Color.rgb(c).string());
        }
      }
    },
    [
      selectedEntityIds,
      selectedShape,
      selectedConnector,
      updateShapeFillColor,
      updateShapeStrokeColor,
      updateConnectorColor,
    ]
  );

  return (
    <div
      className={cn(
        'w-full min-h-[316px] max-h-[616px] px-2',
        (selectedEntityIds.length !== 1 || selectedGroup) && 'hidden'
      )}
    >
      <ColorPickerBase
        onChange={handleColorChange}
        className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
      >
        <ColorPickerSelection />
        <div className="flex items-center gap-4">
          <ColorPickerEyeDropper />
          <div className="grid w-full gap-1">
            <ColorPickerHue />
            <ColorPickerAlpha />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ColorPickerOutput />
          <ColorPickerFormat />
        </div>
      </ColorPickerBase>
      <div className="w-full h-4" />
      <ColorPickerBase
        onChange={handleShapeStrokeColorChange}
        className={cn(
          'max-w-sm rounded-md border bg-background p-4 shadow-sm',
          (selectedEntityIds.length !== 1 || !selectedShape) && 'hidden'
        )}
      >
        <ColorPickerSelection />
        <div className="flex items-center gap-4">
          <ColorPickerEyeDropper />
          <div className="grid w-full gap-1">
            <ColorPickerHue />
            <ColorPickerAlpha />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ColorPickerOutput />
          <ColorPickerFormat />
        </div>
      </ColorPickerBase>
    </div>
  );
};
export default ColorPicker;
