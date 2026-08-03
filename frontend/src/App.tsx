import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useRoutes } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { SiteModeProvider } from "@/contexts/SiteModeContext";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/features/admin/utils/ErrorBoundary";
import routes from "@/routes";

// Log de início de Renderização do App
console.log("🔵 [App] Renderizando componente raiz da aplicação");

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteModeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <RoutesWrapper />
          {/* O Toaster fica na raiz: se ele quebrar sem proteção, leva a árvore inteira junto. */}
          <ErrorBoundary fallback={null}>
            <Toaster />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </SiteModeProvider>
  </QueryClientProvider>
);

function RoutesWrapper() {
  return useRoutes(routes);
}

export default App;