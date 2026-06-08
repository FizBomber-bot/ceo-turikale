import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import Portfolio from "@/pages/Portfolio";
import { Toaster } from "@/components/ui/sonner";

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const handle = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(handle);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="App">
      <div className="grain" aria-hidden="true" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Portfolio />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
