/**
 * Constantes de navegação do aplicativo.
 * Centraliza os links e labels para facilitar manutenção.
 */

import { User } from "@/types/user";

export interface NavLink {
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

export const ROUTES = {
  HOME: "/",
  ACADEMIC_HOME: "/academico",
  LOGIN: "/entrar",
  PROFILE: "/perfil",
  ADMIN: "/admin",
  PROALUNO: "/proaluno",
  MY_PAGE: "/minha-pagina",
} as const;

export interface ContactInfo {
  organization: string;
  department: string;
  location: string;
  email: string;
}

export const CONTACT_INFO: ContactInfo = {
  organization: "Universidade de São Paulo",
  department: "InovaUSP",
  location: "Cidade Universitária",
  email: "bibliotecamoleculares@gmail.com",
};