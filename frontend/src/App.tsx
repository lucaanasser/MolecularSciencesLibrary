import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import VirtualShelfPage from "./pages/VirtualBookShelfPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import ProAlunoPage from "./pages/ProAlunoPage"; 
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "@/components/ProtectedRoute"; 
import DonationPage from "./pages/DonationPage";

// Log de início de renderização do App
console.log("🔵 [App] Renderizando componente raiz da aplicação");

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/estante-virtual" element={<VirtualShelfPage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="/ajude" element={<DonationPage />} /> {/* nova rota */}
          {/* <Route path="/etiquetas" element={<GenerateLabelsPage />} /> */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute allowedRoles={["aluno", "admin", "proaluno"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proaluno"
            element={
              <ProtectedRoute allowedRoles={["proaluno"]}>
                <ProAlunoPage />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;