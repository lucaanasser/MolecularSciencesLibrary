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
import DonationPage from "./pages/library/HelpTheLibrary";
import FAQ from "./pages/library/FAQ";
import { SiteModeProvider } from "./hooks/useSiteMode";
import { RenderPage } from "./components/RenderPage";
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

import TestPage from "./pages/testing/TestPage";

// Log de início de RenderPageização do App
console.log("🔵 [App] RenderPageizando componente raiz da aplicação");

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
            {/* Rota de teste */}
            <Route path="/test" element={RenderPage(TestPage)} />
            <Route path="/" element={RenderPage(Index)} />
            <Route path="/buscar" element={RenderPage(SearchPage)} />
            <Route path="/estante-virtual" element={RenderPage(VirtualShelfPage)} />
            <Route path="/entrar" element={RenderPage(LoginPage)} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="/ajude" element={RenderPage(DonationPage)} />
            <Route
              path="/perfil"
              element={RenderPage(() => (
                <ProtectedRoute allowedRoles={["aluno", "admin", "proaluno"]}>
                  <ProfilePage />
                </ProtectedRoute>
              ))}
            />
            <Route
              path="/minha-pagina"
              element={RenderPage(() => (
                <ProtectedRoute allowedRoles={["aluno", "admin", "proaluno"]}>
                  <PublicProfilePage />
                </ProtectedRoute>
              ))}
            />
            <Route path="/perfil/:userId" element={RenderPage(PublicProfilePage)} />
            <Route
              path="/admin"
              element={RenderPage(() => (
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPage />
                </ProtectedRoute>
              ))}
            />
            <Route
              path="/proaluno"
              element={RenderPage(() => (
                <ProtectedRoute allowedRoles={["proaluno"]}>
                  <ProAlunoPage />
                </ProtectedRoute>
              ))}
            />
            <Route path="/faq" element={RenderPage(FAQ)} />
            {/* Rotas do modo acadêmico */}
            <Route path="/academico" element={RenderPage(AcademicIndexPage)} />
            <Route path="/academico/buscar" element={RenderPage(AcademicSearchPage)} />
            <Route path="/academico/disciplina/:codigo" element={RenderPage(DisciplinePage)} />
            <Route path="/academico/criar-disciplina" element={RenderPage(CreateDisciplinePage)} />
            <Route path="/academico/grade" element={RenderPage(GradePage)} />
            <Route path="/academico/faq" element={RenderPage(AcademicFAQPage)} />
            {/* Rotas do fórum */}
            <Route path="/academico/forum" element={RenderPage(ForumPage)} />
            <Route path="/academico/forum/:id" element={RenderPage(QuestionDetailPage)} />
            <Route path="/academico/forum/nova-pergunta" element={RenderPage(NewQuestionPage)} />
            <Route 
              path="/admin/forum/tags/pending" 
              element={RenderPage(() => (
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPendingTagsPage />
                </ProtectedRoute>
              ))}
            />
            {/* Portal da Transparência */}
            <Route path="/transparencia" element={RenderPage(TransparencyPortalPage)} />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SiteModeProvider>
  </QueryClientProvider>
);

export default App;