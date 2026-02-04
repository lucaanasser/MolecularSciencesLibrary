import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSiteMode } from "@/contexts/SiteModeContext";
import { LIBRARY_NAV_LINKS, ACADEMIC_NAV_LINKS, ROUTES } from "@/constants/navigation";
import { User } from "@/types/user";
import { useIsMobile } from "./useMobile";
import { logger } from "@/utils/logger";

/**
 * Hook consolidado para todo o estado e lógica do Header.
 * Combina estado UI, estilos, navegação e lógica de negócio.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

export const useHeaderState = (user: User | null) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAcademico } = useSiteMode();

  // Estado UI
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpenClass, setDrawerOpenClass] = useState('translate-x-full');
  const [drawerTransition, setDrawerTransition] = useState('duration-500');

  // Lógica de navegação
  const navLinks = useMemo(
    () => isAcademico ? ACADEMIC_NAV_LINKS : LIBRARY_NAV_LINKS,
    [isAcademico]
  );

  const isMainPage = location.pathname === ROUTES.HOME || location.pathname === ROUTES.ACADEMIC_HOME;
  const isPublicProfilePage = location.pathname === ROUTES.MY_PAGE;
  const showProAlunoHeader = user?.role?.toLowerCase() === "proaluno";

  // Estilos dinâmicos
  const drawerBgClass = "primary-bg";
  const lightBackground = (isMainPage && isScrolled) || isPublicProfilePage;

  const textColor = useIsMobile() 
    ? "text-white" 
    : lightBackground ? "text-gray-900" : "text-black";

  const navbarBg = isMobileMenuOpen || !lightBackground
    ? "secondary-bg" 
    : "bg-default-bg";

  const hoverBg = isMobileMenuOpen || !lightBackground 
    ? "hover:bg-white/20" 
    : "hover:bg-gray-200";

  const linkStyle = "flex items-center p-2 rounded-md text-nowrap";

  // Ações de navegação
  const navigateToProfile = () => {
    if (!user) {
      logger.info("🟡 [useHeaderState] Usuário não autenticado, redirecionando para login");
      navigate(ROUTES.LOGIN);
      return;
    }

    const roleRoutes: Record<string, string> = {
      admin: ROUTES.ADMIN,
      proaluno: ROUTES.PROALUNO,
    };

    const destination = roleRoutes[user.role?.toLowerCase()] || ROUTES.PROFILE;
    logger.info(`🔵 [useHeaderState] Navegando para perfil: ${destination}`, { role: user.role });
    navigate(destination);
  };

  const handleLogout = () => {
    logger.info("🔵 [useHeaderState] Usuário fazendo logout", { userName: user?.name });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    logger.info("🟢 [useHeaderState] Logout concluído, redirecionando para login");
    navigate(ROUTES.LOGIN);
  };

  // Controle de scroll
  useEffect(() => {
    if (isMainPage) {
      const handleScroll = () => setIsScrolled(window.scrollY > 0);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(false);
    }
  }, [isMainPage]);

  // Controle de visibilidade do drawer
  useEffect(() => {
    if (isMobileMenuOpen && !isDrawerVisible) {
      setIsDrawerVisible(true);
    }
  }, [isMobileMenuOpen, isDrawerVisible]);

  // Controle de animação do drawer
  useEffect(() => {
    if (isMobileMenuOpen) {
      setDrawerTransition('duration-700');
      const timeout = setTimeout(() => setDrawerOpenClass('translate-x-0'), 10);
      return () => clearTimeout(timeout);
    } else if (isDrawerVisible) {
      setDrawerTransition('duration-500');
      setDrawerOpenClass('translate-x-full');
      const timeout = setTimeout(() => setIsDrawerVisible(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [isMobileMenuOpen, isDrawerVisible]);
  
  // Helpers para navegação baseada em role
  const isRegularUser = (user: User | null): boolean => {
    return !!user && user.role !== "admin" && user.role !== "proaluno";
  };

  const getPageLabel = (user: User | null): string => {
    if (!user) return "";
    if (user.role === "admin") return "Painel Admin";
    if (user.role === "proaluno") return "Painel Pro Aluno";
    return "Minha Conta";
  };
  
  return {
    // Estado UI
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isDrawerVisible,
    drawerOpenClass,
    drawerTransition,
    
    // Dados
    navLinks,
    showProAlunoHeader,
    
    // Estilos
    navbarBg,
    textColor,
    hoverBg,
    drawerBgClass,
    linkStyle,
    
    // Ações
    navigateToProfile,
    handleLogout,

    // Roles
    isRegularUser,
    getPageLabel,
  };
};
