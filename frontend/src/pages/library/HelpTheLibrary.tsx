import HelpTabsCard from "@/features/forms/HelpTabsCard";
import { logger } from "@/utils/logger";

/**
 * Página de ajuda à Biblioteca.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const HelpPageContent = () => {
  // Log de início de renderização da página de ajuda
  logger.info("🔵 [HelpTheLibrary] Renderizando página de ajuda");
  
  return (
    <div className="content-container">
      <h2>Ajude a Biblioteca</h2>
      <p>
        A Biblioteca conta com o apoio da comunidade para crescer e se manter relevante. 
        Você pode contribuir enviando feedbacks, sugerindo novos livros, doando exemplares ou apoiando financeiramente. 
        Toda ajuda é bem-vinda!
      </p>
      <HelpTabsCard />
    </div>
  );
};

export default function HelpPage() {
  return (
    <HelpPageContent />
  );
}
