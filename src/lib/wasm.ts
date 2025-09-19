let initPromise: Promise<typeof import('engine')> | null = null;

export async function loadEngine() {
  if (!initPromise) {
    const wasmModule = await import('engine');
    // Initialize the WASM module - this sets up the runtime
    await wasmModule.default();
    initPromise = Promise.resolve(wasmModule);
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
