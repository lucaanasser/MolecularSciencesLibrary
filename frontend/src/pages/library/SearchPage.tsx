import AcademicSearchPage from "@/pages/academic/AcademicSearchPage";
import { logger } from "@/utils/logger";

/**
 * Página de busca da biblioteca - Reutiliza o componente Molecoogle
 * com modo fixado em "livros" e sem botões de troca de modo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const SearchPage = () => {
  logger.info("🔵 [SearchPage] Renderizando página de busca de livros");
  return <AcademicSearchPage fixedMode="livros" hideModeSwitcher />;
};

export default SearchPage;
