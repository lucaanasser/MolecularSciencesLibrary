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
import PublicProfilePage from "./pages/PublicProfilePage";
import AdminPage from "./pages/AdminPage";
import ProAlunoPage from "./pages/ProAlunoPage"; 
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "@/components/ProtectedRoute"; 
import DonationPage from "./pages/DonationPage";
import FAQ from "./pages/FAQ";
import { SiteModeProvider } from "./hooks/useSiteMode";
import AcademicSearchPage from "./pages/AcademicSearchPage";
import GradePage from "./pages/GradePage";
import AcademicFAQPage from "./pages/AcademicFAQPage";
import AcademicIndexPage from "./pages/AcademicIndexPage";
import DisciplinePage from "./pages/DisciplinePage";
import CreateDisciplinePage from "./pages/CreateDisciplinePage";
import ForumPage from "./pages/ForumPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import NewQuestionPage from "./pages/NewQuestionPage";
import AdminPendingTagsPage from "./pages/AdminPendingTagsPage";

// Log de início de renderização do App
console.log("🔵 [App] Renderizando componente raiz da aplicação");

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteModeProvider>
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
            <Route path="/ajude" element={<DonationPage />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute allowedRoles={["aluno", "admin", "proaluno"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/minha-pagina"
              element={
                <ProtectedRoute allowedRoles={["aluno", "admin", "proaluno"]}>
                  <PublicProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/perfil/:userId" element={<PublicProfilePage />} />
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
            <Route path="/faq" element={<FAQ />} />
            {/* Rotas do modo acadêmico */}
            <Route path="/academico" element={<AcademicIndexPage />} />
            <Route path="/academico/buscar" element={<AcademicSearchPage />} />
            <Route path="/academico/disciplina/:codigo" element={<DisciplinePage />} />
            <Route path="/academico/criar-disciplina" element={<CreateDisciplinePage />} />
            <Route path="/academico/grade" element={<GradePage />} />
            <Route path="/academico/faq" element={<AcademicFAQPage />} />
            {/* Rotas do fórum */}
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:id" element={<QuestionDetailPage />} />
            <Route path="/forum/nova-pergunta" element={<NewQuestionPage />} />
            <Route 
              path="/admin/forum/tags/pending" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPendingTagsPage />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SiteModeProvider>
  </QueryClientProvider>
);

export default App;