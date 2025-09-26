import { Canvas } from '@/components/Canvas';
import { useCanvasKeyboardShortcuts } from '@/hooks';
import { useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

function App() {
  // Enable keyboard shortcuts
  useCanvasKeyboardShortcuts();
  const { theme } = useCanvasStore();

  useEffect(() => {
    // Initialize WASM module
    (async () => {
      try {
        const { helloFromWasm, addInWasm } = await import('@/lib/wasm');
        const msg = await helloFromWasm();
        const sum = await addInWasm(2, 40);
        console.log('WASM initialized:', { msg, sum });
      } catch (err) {
        console.error('WASM init failed', err);
      }
    })();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex flex-col w-screen h-screen">
      {/* <Header /> */}

      <main className="flex-1 relative">
        <Canvas />
      </main>
    </div>
  );
}

export default App;
