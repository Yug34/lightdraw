import type { CanvasState, Connector, Shape, Group } from '@/store/canvasStore';

const DB_NAME = 'LightDrawDB';
const DB_VERSION = 1;
const STORE_NAME = 'canvasState';

export interface PersistedCanvasState {
  viewport: CanvasState['viewport'];
  shapes: Shape[];
  connectors: Connector[];
  groups: Group[];
  lastSaved: number;
}

class PersistenceService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('lastSaved', 'lastSaved', { unique: false });
        }
      };
    });
  }

  async saveCanvasState(state: {
    viewport: CanvasState['viewport'];
    shapes: Shape[];
    connectors: Connector[];
    groups: Group[];
  }): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const persistedState: PersistedCanvasState = {
      viewport: state.viewport,
      shapes: state.shapes,
      connectors: state.connectors,
      groups: state.groups,
      lastSaved: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: 'current', ...persistedState });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save canvas state'));
    });
  }

  async loadCanvasState(): Promise<PersistedCanvasState | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('current');

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Remove the id field and return the state
          const { id, ...state } = result;
          // Ensure arrays are always initialized
          const normalizedState: PersistedCanvasState = {
            viewport: state.viewport || { x: 0, y: 0, zoom: 1 },
            shapes: state.shapes || [],
            connectors: state.connectors || [],
            groups: state.groups || [],
            lastSaved: state.lastSaved || Date.now(),
          };
          resolve(normalizedState);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('Failed to load canvas state'));
    });
  }

  async clearCanvasState(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete('current');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear canvas state'));
    });
  }

  async exportCanvasState(): Promise<string> {
    const state = await this.loadCanvasState();
    return JSON.stringify(state, null, 2);
  }

  async importCanvasState(jsonData: string): Promise<void> {
    try {
      const state = JSON.parse(jsonData) as PersistedCanvasState;
      await this.saveCanvasState(state);
    } catch (error) {
      throw new Error('Invalid JSON data');
    }
  }
}

export const persistenceService = new PersistenceService();
