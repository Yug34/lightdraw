import { create } from 'zustand';

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
}

export type ToolMode = 'none' | 'rectangle' | 'circle' | 'text';

export interface CanvasState {
  // Canvas viewport
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };

  // Canvas dimensions
  canvasSize: {
    width: number;
    height: number;
  };

  // Shapes on canvas
  shapes: Shape[];

  // Selection
  selectedShapeIds: string[];

  // Tool mode
  toolMode: ToolMode;

  // Actions
  setViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  setViewportZoom: (zoom: number) => void;
  setCanvasSize: (size: CanvasState['canvasSize']) => void;
  addShape: (shape: Omit<Shape, 'id'>) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string) => void;
  selectShapes: (ids: string[]) => void;
  clearSelection: () => void;
  moveShape: (id: string, deltaX: number, deltaY: number) => void;
  setToolMode: (mode: ToolMode) => void;
  clearToolMode: () => void;
  placeShapeAtPosition: (x: number, y: number) => void;
}

export const useCanvasStore = create<CanvasState>(set => ({
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },

  canvasSize: {
    width: 800,
    height: 600,
  },

  shapes: [],
  selectedShapeIds: [],
  toolMode: 'none',

  setViewport: viewport =>
    set(state => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  setViewportZoom: zoom =>
    set(state => ({
      viewport: { ...state.viewport, zoom },
    })),

  setCanvasSize: canvasSize => set({ canvasSize }),

  addShape: shapeData => {
    const id = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const shape: Shape = {
      id,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      ...shapeData,
    };

    set(state => ({
      shapes: [...state.shapes, shape],
    }));
  },

  updateShape: (id, updates) =>
    set(state => ({
      shapes: state.shapes.map(shape =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    })),

  deleteShape: id =>
    set(state => ({
      shapes: state.shapes.filter(shape => shape.id !== id),
      selectedShapeIds: state.selectedShapeIds.filter(
        shapeId => shapeId !== id
      ),
    })),

  selectShape: id => set({ selectedShapeIds: [id] }),

  selectShapes: ids => set({ selectedShapeIds: ids }),

  clearSelection: () => set({ selectedShapeIds: [] }),

  moveShape: (id, deltaX, deltaY) =>
    set(state => ({
      shapes: state.shapes.map(shape =>
        shape.id === id
          ? { ...shape, x: shape.x + deltaX, y: shape.y + deltaY }
          : shape
      ),
    })),

  setToolMode: mode => set({ toolMode: mode }),

  clearToolMode: () => set({ toolMode: 'none' }),

  placeShapeAtPosition: (x, y) =>
    set(state => {
      if (state.toolMode === 'none') return state;

      let shapeData: Omit<Shape, 'id'>;

      switch (state.toolMode) {
        case 'rectangle':
          shapeData = {
            type: 'rectangle',
            x: x - 60, // Center the rectangle on the click point
            y: y - 40,
            width: 120,
            height: 80,
            fill: '#3b82f6',
            stroke: '#1e40af',
            strokeWidth: 2,
          };
          break;
        case 'circle':
          shapeData = {
            type: 'circle',
            x: x - 50, // Center the circle on the click point
            y: y - 50,
            width: 100,
            height: 100,
            fill: '#10b981',
            stroke: '#059669',
            strokeWidth: 2,
          };
          break;
        case 'text':
          shapeData = {
            type: 'text',
            x: x - 75, // Center the text on the click point
            y: y - 20,
            width: 150,
            height: 40,
            fill: '#374151',
            stroke: '#6b7280',
            strokeWidth: 1,
            text: 'Hello World',
            fontSize: 16,
          };
          break;
        default:
          return state;
      }

      const id = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const shape: Shape = {
        id,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        ...shapeData,
      };

      return {
        shapes: [...state.shapes, shape],
        toolMode: 'none',
      };
    }),
}));
