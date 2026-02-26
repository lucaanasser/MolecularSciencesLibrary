import VirtualBookshelf from "@/features/virtual-bookshelf/VirtualBookshelf";
import { logger } from "@/utils/logger";

/**
 * Página da Estante Virtual.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function VirtualBookShelfPage() {
  logger.info("🔵 [VirtualBookShelfPage] Renderizando estante virtual");
  return <VirtualBookshelf />;
}