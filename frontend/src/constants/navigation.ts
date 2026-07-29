/**
 * Constantes de navegação do aplicativo.
 * Centraliza os links e labels para facilitar manutenção.
 */

// Links de navegação
interface NavLink {
  to: string;
  label: string;
}

export const LIBRARY_NAV_LINKS: NavLink[] = [
  { to: "/", label: "Início" },
  { to: "/buscar", label: "Buscar" },
  { to: "/estante-virtual", label: "Estante Virtual" },
  { to: "/ajude", label: "Ajude" },
  { to: "/faq", label: "FAQ" },
];

export const ACADEMIC_NAV_LINKS: NavLink[] = [
  { to: "/academico", label: "Início" },
  { to: "/academico/buscar", label: "Buscar" },
  { to: "/academico/grade", label: "Montar Grade" },
  { to: "/academico/forum", label: "Fórum" },
  { to: "/academico/faq", label: "FAQ" },
];

// Rotas principais
export const ROUTES = {
  HOME: "/",
  ACADEMIC_HOME: "/academico",
  LOGIN: "/entrar",
  PROFILE: "/perfil",
  ADMIN: "/admin",
  PROALUNO: "/proaluno",
  MY_PAGE: "/minha-pagina",
  FORUM: "/academico/forum",
  FORUM_NEW: "/academico/forum/nova-pergunta",
  FORUM_MINE: "/academico/forum/minhas",
  ADMIN_FORUM_REPORTS: "/admin/forum/reports",
  ADMIN_FORUM_TAGS: "/admin/forum/tags/pending",
};

/** Caminho da página de detalhe de uma pergunta do fórum. */
export const forumQuestionPath = (id: number | string) =>
  `/academico/forum/${id}`;

/** Caminho do fórum filtrado por tag. */
export const forumTagPath = (tag: string) =>
  `/academico/forum?tag=${encodeURIComponent(tag)}`;

/** Caminho da página de uma disciplina. */
export const disciplinePath = (codigo: string) =>
  `/academico/disciplina/${encodeURIComponent(codigo)}`;

/** Caminho para criar pergunta já vinculada a uma disciplina. */
export const forumNewForDisciplinePath = (codigo: string) =>
  `/academico/forum/nova-pergunta?disciplina=${encodeURIComponent(codigo)}`;

// Informações de contato para rodapé
interface ContactInfo {
  organization: string;
  department: string;
  location: string;
  email: string;
}

export const CONTACT_INFO: ContactInfo = {
  organization: "Universidade de São Paulo",
  department: "InovaUSP",
  location: "Cidade Universitária",
  email: "contato@bibliotecamoleculares.com",
};