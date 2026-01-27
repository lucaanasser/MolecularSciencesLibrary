import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/library/Index";
import NotFound from "./pages/utilities/NotFound";
import SearchPage from "./pages/library/SearchPage";
import VirtualShelfPage from "./pages/library/VirtualBookShelfPage";
import LoginPage from "./pages/utilities/LoginPage";
import ProfilePage from "./pages/library/ProfilePage";
import PublicProfilePage from "./pages/academic/PublicProfilePage";
import AdminPage from "./pages/utilities/AdminPage";
import ProAlunoPage from "./pages/utilities/ProAlunoPage"; 
import ResetPasswordPage from "./pages/utilities/ResetPasswordPage";
import ProtectedRoute from "@/components/ProtectedRoute"; 
import DonationPage from "./pages/library/DonationPage";
import FAQ from "./pages/library/FAQ";
import { SiteModeProvider } from "./hooks/useSiteMode";
import AcademicSearchPage from "./pages/academic/AcademicSearchPage";
import GradePage from "./pages/academic/GradePage";
import AcademicFAQPage from "./pages/academic/AcademicFAQPage";
import AcademicIndexPage from "./pages/academic/AcademicIndexPage";
import DisciplinePage from "./pages/academic/DisciplinePage";
import CreateDisciplinePage from "./pages/academic/CreateDisciplinePage";
import ForumPage from "./pages/academic/ForumPage";
import QuestionDetailPage from "./pages/academic/QuestionDetailPage";
import NewQuestionPage from "./pages/academic/NewQuestionPage";
import AdminPendingTagsPage from "./pages/utilities/AdminPendingTagsPage";
import TransparencyPortalPage from "./pages/library/TransparencyPortalPage";

import FAQTestPage from "./pages/FAQTestPage";


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
            <Route path="/faq-teste" element={<FAQTestPage />} />

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
            <Route path="/academico/forum" element={<ForumPage />} />
            <Route path="/academico/forum/:id" element={<QuestionDetailPage />} />
            <Route path="/academico/forum/nova-pergunta" element={<NewQuestionPage />} />
            <Route 
              path="/admin/forum/tags/pending" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPendingTagsPage />
                </ProtectedRoute>
              } 
            />
            {/* Portal da Transparência */}
            <Route path="/transparencia" element={<TransparencyPortalPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SiteModeProvider>
  </QueryClientProvider>
);

export default App;