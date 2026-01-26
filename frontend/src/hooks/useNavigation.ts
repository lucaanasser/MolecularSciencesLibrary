import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteMode } from "@/hooks/useSiteMode";

export const useNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpenClass, setDrawerOpenClass] = useState('translate-x-full');
  const [drawerTransition, setDrawerTransition] = useState('duration-500');
  
  const location = useLocation();
  const { isAcademico } = useSiteMode();

  // Links baseados no modo atual
  const navLinks = isAcademico
    ? [
        { to: "/academico", label: "Início" },
        { to: "/academico/buscar", label: "Buscar" },
        { to: "/academico/grade", label: "Montar Grade" },
        { to: "/forum", label: "Fórum" },
        { to: "/academico/faq", label: "FAQ" },
      ]
    : [
        { to: "/", label: "Início" },
        { to: "/buscar", label: "Buscar" },
        { to: "/estante-virtual", label: "Estante Virtual" },
        { to: "/ajude", label: "Ajude" },
        { to: "/faq", label: "FAQ" },
      ];

  // Controle de scroll para background dinâmico
  useEffect(() => {
    const isMainPage = location.pathname === "/" || location.pathname === "/academico";
    if (isMainPage) {
      const handleScroll = () => setIsScrolled(window.scrollY > 0);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(false);
    }
  }, [location.pathname]);

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

  return {
    navLinks,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isDrawerVisible,
    isScrolled,
    drawerOpenClass,
    drawerTransition,
    isMainPage: location.pathname === "/" || location.pathname === "/academico",
    isPublicProfilePage: location.pathname === "/minha-pagina",
  };
};