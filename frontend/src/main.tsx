import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log de início de renderização da aplicação
console.log("🔵 [main.tsx] Inicializando aplicação React");

createRoot(document.getElementById("root")!).render(<App />);
