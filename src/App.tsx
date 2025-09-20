import { Canvas } from '@/components/Canvas';
import { addInWasm, greetFromWasm, helloFromWasm } from '@/lib/wasm';
import { useEffect, useState } from 'react';

function App() {
  const [wasmMsg, setWasmMsg] = useState<string>('');
  const [sum, setSum] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const msg = await helloFromWasm();
        setWasmMsg(msg);
        const s = await addInWasm(2, 40);
        setSum(s);
      } catch (err) {
        console.error('WASM init failed', err);
      }
    })();
  }, []);

  const handleGreet = async () => {
    try {
      await greetFromWasm('World!');
    } catch (err) {
      console.error('Greet failed', err);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen">
      {/* <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">LightDraw</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div>WASM: {wasmMsg || 'loading...'}</div>
            <div>2 + 40 = {sum ?? '...'}</div>
            <button
              onClick={handleGreet}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Greet from WASM
            </button>
          </div>
        </div>
      </header> */}

      <main className="flex-1 relative">
        <Canvas />
      </main>
    </div>
  );
}

export default App;
