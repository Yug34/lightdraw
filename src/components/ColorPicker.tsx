import {
  ColorPicker as ColorPickerBase,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@/components/ui/color-picker-base';
// import { useCanvas } from '@/hooks';

const ColorPicker = () => {
  // const {
  //   selectedEntityIds,
  //   shapes,
  //   connectors,
  // } = useCanvas();

  // const selectedId = selectedEntityIds[0];
  // const selectedShape = (shapes || []).find(s => s.id === selectedId);
  // const selectedConnector = (connectors || []).find(c => c.id === selectedId);

  // const handleColorChange = (color: string) => {
  //   if (selectedShape) {
  //     updateShapeColor(selectedShape.id, color);
  //   }
  //   if (selectedConnector) {
  //     updateConnectorColor(selectedConnector.id, color);
  //   }
  // };

  return (
    <ColorPickerBase className="max-w-sm rounded-md border bg-background p-4 shadow-sm">
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
