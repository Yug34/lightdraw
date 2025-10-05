import { persistenceService } from '@/lib/persistence';
import Color from 'color';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Theme localStorage helpers
const THEME_STORAGE_KEY = 'lightdraw-theme';

const getStoredTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'light';
  } catch {
    return 'light';
  }
};

const setStoredTheme = (theme: 'light' | 'dark'): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Silently fail if localStorage is not available
  }
};

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
  rotation?: number; // Rotation in degrees
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

export interface Group {
  id: string;
  name?: string;
  entityIds: string[]; // IDs of shapes and connectors in this group
  x: number; // Bounding box position
  y: number; // Bounding box position
  width: number; // Bounding box width
  height: number; // Bounding box height
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
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
  theme: 'light' | 'dark';
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
  groups: Group[];

  selectedEntityIds: string[];

  toolMode: ToolMode;
  pendingConnectorStart: Point | null;

  selectedColor: Parameters<typeof Color>[0];

  setViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  setViewportZoom: (zoom: number) => void;
  setCanvasSize: (size: CanvasState['canvasSize']) => void;
  addShape: (shape: Omit<Shape, 'id'>) => void;
  addConnector: (connector: Omit<Connector, 'id'>) => void;
  updateShape: (
    id: string,
    updates: Partial<Shape>,
    options?: { recordHistory?: boolean }
  ) => void;
  updateConnector: (
    id: string,
    updates: Partial<Connector>,
    options?: { recordHistory?: boolean }
  ) => void;
  deleteEntity: (id: string) => void;
  selectEntity: (id: string) => void;
  selectEntities: (ids: string[]) => void;
  clearSelection: () => void;
  moveShape: (id: string, deltaX: number, deltaY: number) => void;
  rotateShape: (id: string, rotation: number) => void;
  resizeShape: (
    id: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) => void;
  setToolMode: (mode: ToolMode) => void;
  clearToolMode: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
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

  history: CanvasSnapshot[];
  canUndo: boolean;
  undo: () => void;
  pushHistorySnapshot: (snapshot: CanvasSnapshot) => void;

  // Group management functions
  addGroup: (entityIds: string[], name?: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  calculateGroupBoundingBox: (entityIds: string[]) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CanvasSnapshot {
  shapes: Shape[];
  connectors: Connector[];
  groups: Group[];
}

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector((set, get) => ({
    theme: getStoredTheme(),
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
    groups: [],
    selectedEntityIds: [],
    toolMode: 'none',
    pendingConnectorStart: null,
    isSaving: false,
    history: [],
    canUndo: false,

    selectedColor: '[0, 0, 0, NaN]',

    pushHistorySnapshot: snapshot =>
      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (snapshot.shapes || []).map(s => ({ ...s })),
            connectors: (snapshot.connectors || []).map(c => ({ ...c })),
            groups: (snapshot.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
      })),

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
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
        shapes: [...state.shapes, shape],
      }));
    },

    addConnector: connectorData => {
      const id = `connector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const connector: Connector = {
        id,
        strokeWidth: 2,
        ...connectorData,
      };
      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
        connectors: [...state.connectors, connector],
      }));
    },

    updateShape: (id, updates, options) =>
      set(state => {
        const recordHistory = options?.recordHistory !== false;
        return {
          history: recordHistory
            ? [
                ...state.history,
                {
                  shapes: (state.shapes || []).map(s => ({ ...s })),
                  connectors: (state.connectors || []).map(c => ({ ...c })),
                  groups: (state.groups || []).map(g => ({ ...g })),
                },
              ]
            : state.history,
          canUndo: recordHistory ? true : state.canUndo,
          shapes: state.shapes.map(shape =>
            shape.id === id ? { ...shape, ...updates } : shape
          ),
        };
      }),

    updateConnector: (id, updates, options) =>
      set(state => {
        const recordHistory = options?.recordHistory !== false;
        return {
          history: recordHistory
            ? [
                ...state.history,
                {
                  shapes: (state.shapes || []).map(s => ({ ...s })),
                  connectors: (state.connectors || []).map(c => ({ ...c })),
                  groups: (state.groups || []).map(g => ({ ...g })),
                },
              ]
            : state.history,
          canUndo: recordHistory ? true : state.canUndo,
          connectors: state.connectors.map(connector =>
            connector.id === id ? { ...connector, ...updates } : connector
          ),
        };
      }),

    deleteEntity: id =>
      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
        shapes: (state.shapes || []).filter(shape => shape.id !== id),
        connectors: (state.connectors || []).filter(
          connector => connector.id !== id
        ),
        selectedEntityIds: state.selectedEntityIds.filter(
          entityId => entityId !== id
        ),
      })),

    selectEntity: id => set({ selectedEntityIds: [id] }),

    selectEntities: ids => set({ selectedEntityIds: ids }),

    clearSelection: () => set({ selectedEntityIds: [] }),

    moveShape: (id, deltaX, deltaY) =>
      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
        shapes: state.shapes.map(shape =>
          shape.id === id
            ? { ...shape, x: shape.x + deltaX, y: shape.y + deltaY }
            : shape
        ),
      })),

    rotateShape: (id, rotation) =>
      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
        shapes: state.shapes.map(shape =>
          shape.id === id ? { ...shape, rotation } : shape
        ),
      })),

    resizeShape: (id, width, height, x, y) => {
      set(state => {
        const newState = {
          history: [
            ...state.history,
            {
              shapes: (state.shapes || []).map(s => ({ ...s })),
              connectors: (state.connectors || []).map(c => ({ ...c })),
              groups: (state.groups || []).map(g => ({ ...g })),
            },
          ],
          canUndo: true,
          shapes: state.shapes.map(shape =>
            shape.id === id
              ? {
                  ...shape,
                  width: Math.max(10, width), // Minimum width of 10
                  height: Math.max(10, height), // Minimum height of 10
                  x: x ?? shape.x,
                  y: y ?? shape.y,
                }
              : shape
          ),
        };
        return newState;
      });
    },

    setToolMode: mode => set({ toolMode: mode }),

    clearToolMode: () => set({ toolMode: 'none' }),

    setTheme: theme => {
      setStoredTheme(theme);
      set({ theme });
    },

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
          history: [
            ...state.history,
            {
              shapes: (state.shapes || []).map(s => ({ ...s })),
              connectors: (state.connectors || []).map(c => ({ ...c })),
              groups: (state.groups || []).map(g => ({ ...g })),
            },
          ],
          canUndo: true,
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
        strokeWidth: 2,
        ...additionalProps,
      };

      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
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
            viewport: persistedState.viewport || { x: 0, y: 0, zoom: 1 },
            connectors: persistedState.connectors || [],
            shapes: persistedState.shapes || [],
            groups: persistedState.groups || [],
          });
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
        // Ensure arrays are initialized even if loading fails
        set(state => ({
          connectors: state.connectors || [],
          shapes: state.shapes || [],
          groups: state.groups || [],
        }));
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
          groups: state.groups,
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
          connectors: [],
          groups: [],
          selectedEntityIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        });
      } catch (error) {
        console.error('Failed to clear persisted state:', error);
      }
    },

    undo: () =>
      set(state => {
        if (state.history.length === 0) return state;
        const previous = state.history[state.history.length - 1];
        const nextHistory = state.history.slice(0, -1);
        return {
          history: nextHistory,
          canUndo: nextHistory.length > 0,
          shapes: (previous.shapes || []).map(s => ({ ...s })),
          connectors: (previous.connectors || []).map(c => ({ ...c })),
          groups: (previous.groups || []).map(g => ({ ...g })),
          selectedEntityIds: [],
        };
      }),

    // Group management functions
    calculateGroupBoundingBox: entityIds => {
      const state = get();
      if (entityIds.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      // Calculate bounding box for shapes
      entityIds.forEach(id => {
        const shape = state.shapes.find(s => s.id === id);
        if (shape) {
          minX = Math.min(minX, shape.x);
          minY = Math.min(minY, shape.y);
          maxX = Math.max(maxX, shape.x + shape.width);
          maxY = Math.max(maxY, shape.y + shape.height);
        }

        const connector = state.connectors.find(c => c.id === id);
        if (connector) {
          minX = Math.min(minX, connector.x, connector.targetX);
          minY = Math.min(minY, connector.y, connector.targetY);
          maxX = Math.max(maxX, connector.x, connector.targetX);
          maxY = Math.max(maxY, connector.y, connector.targetY);
        }
      });

      const padding = 10; // Add some padding around the group
      return {
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
      };
    },

    addGroup: (entityIds, name) => {
      const state = get();
      if (entityIds.length < 2) return; // Need at least 2 entities to create a group

      const boundingBox = state.calculateGroupBoundingBox(entityIds);
      const id = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const group: Group = {
        id,
        name: name || `Group ${state.groups.length + 1}`,
        entityIds,
        ...boundingBox,
        stroke: '#3b82f6',
        strokeWidth: 2,
        fill: 'transparent',
        opacity: 0.8,
      };

      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
        groups: [...state.groups, group],
      }));
    },

    updateGroup: (id, updates) =>
      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
        groups: state.groups.map(group =>
          group.id === id ? { ...group, ...updates } : group
        ),
      })),

    deleteGroup: id =>
      set(state => ({
        history: [
          ...state.history,
          {
            shapes: (state.shapes || []).map(s => ({ ...s })),
            connectors: (state.connectors || []).map(c => ({ ...c })),
            groups: (state.groups || []).map(g => ({ ...g })),
          },
        ],
        canUndo: true,
        groups: state.groups.filter(group => group.id !== id),
      })),
  }))
);

// Auto-save middleware - save state whenever shapes or viewport changes
let saveTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 1000; // Save after 1 second of inactivity

useCanvasStore.subscribe(
  state => ({
    shapes: state.shapes,
    connectors: state.connectors,
    groups: state.groups,
    viewport: state.viewport,
  }),
  (current, previous) => {
    // Only save if shapes, connectors, groups or viewport actually changed
    if (
      previous &&
      (current.shapes !== previous.shapes ||
        current.connectors !== previous.connectors ||
        current.groups !== previous.groups ||
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
