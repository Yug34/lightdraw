let initPromise: Promise<typeof import('engine')> | null = null;

export async function loadEngine() {
  if (!initPromise) {
    console.log('Loading WASM module...');
    try {
      const wasmModule = await import('engine');
      console.log('WASM module imported:', wasmModule);
      console.log('Available exports:', Object.keys(wasmModule));

      console.log('Initializing WASM module...');
      const initResult = await wasmModule.default();
      console.log('WASM module initialized, result:', initResult);

      initPromise = Promise.resolve(wasmModule);
    } catch (error) {
      console.error('Error loading WASM module:', error);
      throw error;
    }
  }
  return initPromise;
}

export async function helloFromWasm(): Promise<string> {
  const mod = await loadEngine();
  return mod.hello();
}

export async function addInWasm(a: number, b: number): Promise<number> {
  const mod = await loadEngine();
  return mod.add(a, b);
}

export async function greetFromWasm(name: string): Promise<void> {
  const mod = await loadEngine();
  console.log('WASM module loaded:', mod);
  console.log('greet function:', mod.greet);
  if (typeof mod.greet !== 'function') {
    throw new Error('greet function is not available on WASM module');
  }
  return mod.greet(name);
}
