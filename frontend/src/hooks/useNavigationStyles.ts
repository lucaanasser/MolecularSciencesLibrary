import { useSiteMode } from "@/hooks/useSiteMode";

interface StyleConfig {
  navbarBg: string;
  textColor: string;
  hoverBg: string;
  buttonVariant: "ghost" | "outline";
  buttonColors: string;
  drawerBgClass: string;
  primaryColor: string;
}

export const useNavigationStyles = (
  isMobileMenuOpen: boolean,
  isScrolled: boolean,
  isMainPage: boolean,
  isPublicProfilePage: boolean
): StyleConfig => {
  const { isAcademico } = useSiteMode();

  const primaryColor = isAcademico ? "cm-academic" : "cm-purple";
  const primaryColorClass = isAcademico ? "bg-cm-academic/80" : "bg-cm-purple/80";
  const drawerBgClass = isAcademico ? "bg-cm-academic" : "bg-cm-purple";

  const whiteBackground = (isMainPage && isScrolled) || isPublicProfilePage;

  const navbarBg = isMobileMenuOpen 
    ? primaryColorClass 
    : whiteBackground ? "bg-white" : primaryColorClass;

  const textColor = isMobileMenuOpen 
    ? "text-black" 
    : whiteBackground ? "text-gray-900" : "text-black";

  const hoverBg = whiteBackground ? "hover:bg-gray-200" : "hover:bg-white/20";
  const buttonVariant = whiteBackground ? "outline" : "ghost";

  const buttonColors = whiteBackground || isMobileMenuOpen
    ? `border-none bg-white text-${primaryColor} hover:bg-${primaryColor} hover:text-white`
    : `text-black hover:bg-${primaryColor} hover:text-white`;

  return {
    navbarBg,
    textColor,
    hoverBg,
    buttonVariant,
    buttonColors,
    drawerBgClass,
    primaryColor,
  };
};