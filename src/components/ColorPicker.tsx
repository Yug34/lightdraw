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
import Color from 'color';
import { useCallback } from 'react';

const ColorPicker = () => {
  const {
    selectedEntityIds,
    shapes,
    connectors,
    updateShapeColor,
    updateConnectorColor,
  } = useCanvas();

  const selectedId = selectedEntityIds[0];
  const selectedShape = (shapes || []).find(s => s.id === selectedId);
  const selectedConnector = (connectors || []).find(c => c.id === selectedId);

  const handleColorChange = useCallback(
    (c: Parameters<typeof Color.rgb>[0]) => {
      if (selectedEntityIds.length === 1) {
        if (selectedShape) {
          updateShapeColor(selectedShape.id, Color.rgb(c).string());
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
      updateShapeColor,
      updateConnectorColor,
    ]
  );

  return (
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
  );
};
export default ColorPicker;
