/**
 * Flags de funcionalidades ainda não liberadas para produção.
 *
 * Por padrão ficam ligadas em desenvolvimento (`npm run dev`) e desligadas no
 * build de produção, para que o código possa viver na branch dev — e até ser
 * mergeado — sem aparecer em bibliotecamoleculares.com.
 *
 * Para forçar o valor em um build específico:
 *   VITE_FEATURE_MODO_ACADEMICO=true npm run build
 */
const flag = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === "" ? fallback : value === "true";

export const FEATURES = {
  /** Switch Biblioteca ↔ Acadêmico no header, com troca de tema e de links de navegação. */
  modoAcademico: flag(import.meta.env.VITE_FEATURE_MODO_ACADEMICO, import.meta.env.DEV),

  /** Item "Página Pessoal" no menu do usuário. Depende de /api/profiles ser portado para o Worker. */
  paginaPessoal: flag(import.meta.env.VITE_FEATURE_PAGINA_PESSOAL, import.meta.env.DEV),
};
