import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log de início de renderização da aplicação
console.log("🔵 [main.tsx] Inicializando aplicação React");

createRoot(document.getElementById("root")!).render(<App />);

// Registro do service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Primeiro, limpa todos os caches existentes
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Limpando cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Depois registra o service worker
      return navigator.serviceWorker.register('/service-worker.js');
    }).then(reg => {
      console.log('Service Worker registrado:', reg);
      
      // Força atualização se houver uma nova versão
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nova versão do Service Worker disponível. Recarregando...');
              window.location.reload();
            }
          });
        }
      });
    }).catch(err => {
      console.error('Erro ao registrar Service Worker:', err);
      // Em caso de erro, limpa todos os caches e recarrega
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      }).then(() => {
        console.log('Caches limpos devido a erro no Service Worker');
      });
    });
  });
}
