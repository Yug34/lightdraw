import { persistenceService } from '@/lib/persistence';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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

export interface Connector {
  id: string;
  type: 'arrow' | 'line' | 'double-arrow' | 'dotted' | 'orthogonal';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // Additional properties for specific connector types
  dashArray?: string; // For dotted connectors
  label?: string; // For labeled connectors
}

export interface Entity {
  id: string;
  type: 'shape' | 'connector';
  entityData: Shape | Connector;
}

export type ToolMode =
  | 'none'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'arrow'
  | 'line'
  | 'double-arrow'
  | 'dotted';

export interface CanvasState {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };

  canvasSize: {
    width: number;
    height: number;
  };

  shapes: Shape[];
  connectors: Connector[];

  selectedEntityIds: string[];

  toolMode: ToolMode;
  pendingConnectorStart: Point | null;

  setViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  setViewportZoom: (zoom: number) => void;
  setCanvasSize: (size: CanvasState['canvasSize']) => void;
  addShape: (shape: Omit<Shape, 'id'>) => void;
  addConnector: (connector: Omit<Connector, 'id'>) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteEntity: (id: string) => void;
  selectEntity: (id: string) => void;
  selectEntities: (ids: string[]) => void;
  clearSelection: () => void;
  moveShape: (id: string, deltaX: number, deltaY: number) => void;
  setToolMode: (mode: ToolMode) => void;
  clearToolMode: () => void;
  setPendingConnectorStart: (point: Point | null) => void;
  placeShapeAtPosition: (x: number, y: number) => void;
  placeConnectorAtPosition: (
    x: number,
    y: number,
    targetX: number,
    targetY: number
  ) => void;
  loadPersistedState: () => Promise<void>;
  savePersistedState: () => Promise<void>;
  clearPersistedState: () => Promise<void>;
  isSaving: boolean;
}

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector((set, get) => ({
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
    connectors: [],
    selectedEntityIds: [],
    toolMode: 'none',
    pendingConnectorStart: null,
    isSaving: false,

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

    addConnector: connectorData => {
      const id = `connector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const connector: Connector = {
        id,
        fill: '#000000',
        stroke: '#000000',
        strokeWidth: 2,
        ...connectorData,
      };
      set(state => ({
        connectors: [...state.connectors, connector],
      }));
    },

    updateShape: (id, updates) =>
      set(state => ({
        shapes: state.shapes.map(shape =>
          shape.id === id ? { ...shape, ...updates } : shape
        ),
      })),

    deleteEntity: id =>
      set(state => ({
        shapes: state.shapes.filter(shape => shape.id !== id),
        connectors: state.connectors.filter(connector => connector.id !== id),
        selectedEntityIds: state.selectedEntityIds.filter(
          entityId => entityId !== id
        ),
      })),

    selectEntity: id => set({ selectedEntityIds: [id] }),

    selectEntities: ids => set({ selectedEntityIds: ids }),

    clearSelection: () => set({ selectedEntityIds: [] }),

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

    setPendingConnectorStart: point => set({ pendingConnectorStart: point }),

    placeShapeAtPosition: (x, y) =>
      set(state => {
        if (state.toolMode === 'none') return state;

        let shapeData: Omit<Shape, 'id'>;

        switch (state.toolMode) {
          case 'rectangle':
            shapeData = {
              type: 'rectangle',
              x: x - 120 / 2, // Center the rectangle on the click point
              y: y - 80 / 2,
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
              x: x - 100 / 2, // Center the circle on the click point
              y: y - 100 / 2,
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
              x: x - 150 / 2, // Center the text on the click point
              y: y - 40 / 2,
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

    placeConnectorAtPosition: (x, y, targetX, targetY) => {
      const state = get();
      const id = `connector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Determine connector type from current tool mode
      let connectorType: Connector['type'] = 'arrow';
      let additionalProps: Partial<Connector> = {};

      switch (state.toolMode) {
        case 'line':
          connectorType = 'line';
          break;
        case 'double-arrow':
          connectorType = 'double-arrow';
          break;
        case 'dotted':
          connectorType = 'dotted';
          additionalProps.dashArray = '5,5';
          break;
        default:
          connectorType = 'arrow';
      }

      const connector: Connector = {
        id,
        x,
        y,
        targetX,
        targetY,
        type: connectorType,
        fill: '#000000',
        stroke: '#000000',
        strokeWidth: 2,
        ...additionalProps,
      };

      set(state => ({
        connectors: [...state.connectors, connector],
        toolMode: 'none',
      }));
    },

    loadPersistedState: async () => {
      try {
        await persistenceService.init();
        const persistedState = await persistenceService.loadCanvasState();

        if (persistedState) {
          set({
            viewport: persistedState.viewport,
            connectors: persistedState.connectors,
            shapes: persistedState.shapes,
          });
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
      }
    },

    savePersistedState: async () => {
      try {
        set({ isSaving: true });
        await persistenceService.init();
        const state = get();
        await persistenceService.saveCanvasState({
          viewport: state.viewport,
          shapes: state.shapes,
          connectors: state.connectors,
        });
      } catch (error) {
        console.error('Failed to save state:', error);
      } finally {
        set({ isSaving: false });
      }
    },

    clearPersistedState: async () => {
      try {
        await persistenceService.init();
        await persistenceService.clearCanvasState();
        set({
          shapes: [],
          selectedEntityIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        });
      } catch (error) {
        console.error('Failed to clear persisted state:', error);
      }
    },
  }))
);

// Auto-save middleware - save state whenever shapes or viewport changes
let saveTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 1000; // Save after 1 second of inactivity

useCanvasStore.subscribe(
  state => ({
    shapes: state.shapes,
    connectors: state.connectors,
    viewport: state.viewport,
  }),
  (current, previous) => {
    // Only save if shapes or viewport actually changed
    if (
      previous &&
      (current.shapes !== previous.shapes ||
        current.connectors !== previous.connectors ||
        current.viewport !== previous.viewport)
    ) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      saveTimeout = setTimeout(() => {
        useCanvasStore.getState().savePersistedState();
      }, DEBOUNCE_DELAY);
    }
  }
);
