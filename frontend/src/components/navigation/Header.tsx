import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHeaderState } from "@/hooks/useHeaderState";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

/**
 * Componente de navegação principal (Header).
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const Navigation: React.FC = () => {
  const user = useCurrentUser();
  const headerState = useHeaderState(user);
  
  // Log de renderização
  logger.info("🔵 [Header] Renderizando barra de navegação", { 
    userRole: user?.role, 
    isMobileMenuOpen: headerState.isMobileMenuOpen 
  });

  return (
    <nav className={cn("sticky top-0 z-50 w-full transition-colors duration-300", headerState.navbarBg, headerState.textColor)}>
      <div className="content-container px-4 sm:px-6 lg:px-8 relative z-20 flex justify-between h-24">
        <DesktopNav user={user} headerState={headerState} />
        <MobileNav user={user} headerState={headerState} />
      </div>
    </nav>
  );
};

export default Navigation;
