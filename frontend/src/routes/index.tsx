// Centralizador de rotas da aplicação
import { RouteObject } from "react-router-dom";
import { RenderPage } from "@/components/RenderPage";
import ProtectedRoute from "@/components/ProtectedRoute";

// Importação das páginas
import Index from "@/pages/library/Index";
import LibrarySearchPage from "@/pages/library/LibrarySearchPage";
import VirtualShelfPage from "@/pages/library/VirtualBookShelfPage";
import DonationPage from "@/pages/library/HelpTheLibrary";
import FAQ from "@/pages/library/FAQ";
import TransparencyPortalPage from "@/pages/library/TransparencyPortalPage";
import LibrarySearchResultsPage from "@/pages/library/LibrarySearchResultsPage";
import BookPage from "@/pages/library/BookPage";

import AcademicIndexPage from "@/pages/academic/AcademicIndexPage";
import AcademicSearchPage from "@/pages/academic/AcademicSearchPage";
import AcademicSearchResultsPage from "@/pages/academic/AcademicSearchResultsPage";
import AcademicUserSearchResultsPage from "@/pages/academic/AcademicUserSearchResultsPage";
import DisciplinePage from "@/pages/academic/DisciplinePage";
import CreateDisciplinePage from "@/pages/academic/CreateDisciplinePage";
import GradePage from "@/pages/academic/GradePage";
import AcademicFAQPage from "@/pages/academic/AcademicFAQPage";
import ForumPage from "@/pages/academic/ForumPage";
import QuestionDetailPage from "@/pages/academic/QuestionDetailPage";
import NewQuestionPage from "@/pages/academic/NewQuestionPage";
import ProfilePage from "@/pages/library/ProfilePage";
import PublicProfilePage from "@/pages/academic/PublicProfilePage";

import AccountCreationPage from "@/pages/utilities/AccountCreationPage";
import AdminPage from "@/pages/utilities/AdminPage";
import AdminPendingTagsPage from "@/pages/utilities/AdminPendingTagsPage";
import LoginPage from "@/pages/utilities/LoginPage";
import ProAlunoPage from "@/pages/utilities/ProAlunoPage";
import ResetPasswordPage from "@/pages/utilities/ResetPasswordPage";
import PageNotFound from "@/pages/utilities/PageNotFound";

import TestPage from "@/pages/testing/TestPage";

const routes: RouteObject[] = [
  // Rota de teste
  { path: "/test", element: RenderPage(TestPage) },

  // Rotas do modo biblioteca
  { path: "/", element: RenderPage(Index) },
  { path: "/buscar", element: RenderPage(LibrarySearchPage) },
  { path: "/estante-virtual", element: RenderPage(VirtualShelfPage) },
  { path: "/ajude", element: RenderPage(DonationPage) },
  { path: "/faq", element: RenderPage(FAQ) },
  { path: "/transparencia", element: RenderPage(TransparencyPortalPage) },
  { path: "/biblioteca/buscar", element: RenderPage(LibrarySearchPage) },
  { path: "/biblioteca/buscar/resultados", element: RenderPage(LibrarySearchResultsPage) },
  { path: "/biblioteca/livro/:id", element: RenderPage(BookPage) },

  // Rotas do modo acadêmico
  { path: "/academico", element: RenderPage(AcademicIndexPage) },
  { path: "/academico/buscar", element: RenderPage(AcademicSearchPage) },
  { path: "/academico/buscar/resultados", element: RenderPage(AcademicSearchResultsPage) },
  { path: "/academico/buscar/usuarios", element: RenderPage(AcademicUserSearchResultsPage) },
  { path: "/academico/disciplina/:codigo", element: RenderPage(DisciplinePage) },
  { path: "/academico/criar-disciplina", element: RenderPage(CreateDisciplinePage) },
  { path: "/academico/grade", element: RenderPage(GradePage) },
  { path: "/academico/faq", element: RenderPage(AcademicFAQPage) },
  { path: "/academico/forum", element: RenderPage(ForumPage) },
  { path: "/academico/forum/:id", element: RenderPage(QuestionDetailPage) },
  { path: "/academico/forum/nova-pergunta", element: RenderPage(NewQuestionPage) },

  // Utilitários
  { path: "/criar-conta", element: RenderPage(AccountCreationPage) },
  { path: "/admin/forum/tags/pending", element: RenderPage(() => (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminPendingTagsPage />
      </ProtectedRoute>
    )) },
  { path: "/entrar", element: RenderPage(LoginPage) },
  { path: "/redefinir-senha", element: <ResetPasswordPage /> },
  { path: "/perfil", element: RenderPage(() => (
      <ProtectedRoute allowedRoles={["aluno", "admin", "proaluno"]}>
        <ProfilePage />
      </ProtectedRoute>
    )) },
  { path: "/minha-pagina", element: RenderPage(() => (
      <ProtectedRoute allowedRoles={["aluno", "admin", "proaluno"]}>
        <PublicProfilePage />
      </ProtectedRoute>
    )) },
  { path: "/perfil/:userId", element: RenderPage(PublicProfilePage) },
  { path: "/admin", element: RenderPage(() => (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminPage />
      </ProtectedRoute>
    )) },
  { path: "/proaluno", element: RenderPage(() => (
      <ProtectedRoute allowedRoles={["proaluno"]}>
        <ProAlunoPage />
      </ProtectedRoute>
    )) },

  // Catch all
  { path: "*", element: <PageNotFound /> },
];

export default routes;