import { useState } from "react";
import "./App.css";
import { Button } from "@/components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="text-2xl font-bold text-blue-500">Vite + React</div>
      <Button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </Button>
    </>
  );
}

export default App;
