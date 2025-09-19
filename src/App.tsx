import { Button } from '@/components/ui/button';
import { addInWasm, helloFromWasm } from '@/lib/wasm';
import { useEffect, useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
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

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <Button onClick={() => setCount(count => count + 1)}>
        count is {count}
      </Button>
      <div className="mt-4 text-sm text-gray-600">
        <div>WASM: {wasmMsg || 'loading...'}</div>
        <div>2 + 40 = {sum ?? '...'}</div>
      </div>
    </div>
  );
}

export default App;
