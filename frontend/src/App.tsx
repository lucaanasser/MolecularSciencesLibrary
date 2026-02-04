import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useRoutes } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { SiteModeProvider } from "@/contexts/SiteModeContext";
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
        </BrowserRouter>
      </TooltipProvider>
    </SiteModeProvider>
  </QueryClientProvider>
);

function RoutesWrapper() {
  return useRoutes(routes);
}

export default App;