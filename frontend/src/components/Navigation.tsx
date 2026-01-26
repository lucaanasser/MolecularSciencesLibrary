import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigation } from "@/hooks/useNavigation";
import { useNavigationStyles } from "@/hooks/useNavigationStyles";
import ModeSwitcher from "./ModeSwitcher";
import { NavigationLinks } from "./navigation/NavigationLinks";
import { UserMenu } from "./navigation/UserMenu";
import { MobileDrawer } from "./navigation/MobileDrawer";

const Navigation: React.FC = () => {
  const user = useCurrentUser();
  const navigate = useNavigate();
  
  const {
    navLinks,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isDrawerVisible,
    isScrolled,
    drawerOpenClass,
    drawerTransition,
    isMainPage,
    isPublicProfilePage,
  } = useNavigation();

  const {
    navbarBg,
    textColor,
    hoverBg,
    buttonVariant,
    buttonColors,
    drawerBgClass,
  } = useNavigationStyles(isMobileMenuOpen, isScrolled, isMainPage, isPublicProfilePage);

  const showProAlunoHeader = user?.role?.toLowerCase() === "proaluno";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/entrar");
  };

  const handleProfileClick = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user?.role === "proaluno") {
      navigate("/proaluno");
    } else {
      navigate("/perfil");
    }
  };

  return (
    <nav className={`relative ${navbarBg} ${textColor} sticky top-0 z-50 w-full transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex justify-between h-24">
        
        {/* Logo e Mode Switcher */}
        <div className="flex items-center gap-4">
          <Link to={navLinks[0].to} className="flex items-center">
            <img 
              src="/images/logoestendido.png" 
              alt="Logo da Biblioteca" 
              className="h-20" 
              onError={(e) => { e.currentTarget.src = "/images/logoestendido.png"; }} 
            />
          </Link>
          <ModeSwitcher />
        </div>

        {/* Versão desktop */}
        <div className="hidden lg:flex lg:items-center lg:space-x-4">
          <NavigationLinks 
            navLinks={navLinks}
            showProAlunoHeader={showProAlunoHeader}
            textColor={textColor}
            hoverBg={hoverBg}
          />
          <UserMenu
            user={user}
            textColor={textColor}
            hoverBg={hoverBg}
            buttonVariant={buttonVariant}
            buttonColors={buttonColors}
            isScrolled={isScrolled}
            handleProfileClick={handleProfileClick}
            handleLogout={handleLogout}
            navigate={navigate}
          />
        </div>

        {/* Botão menu mobile */}
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`${textColor} ${hoverBg}`}
          >
            <Menu size={24} className="text-black" />
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      <MobileDrawer
        isDrawerVisible={isDrawerVisible}
        drawerBgClass={drawerBgClass}
        drawerTransition={drawerTransition}
        drawerOpenClass={drawerOpenClass}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <NavigationLinks 
          navLinks={navLinks}
          showProAlunoHeader={showProAlunoHeader}
          textColor="text-white"
          hoverBg={hoverBg}
          isMobile={true}
          onLinkClick={() => setIsMobileMenuOpen(false)}
        />
        <UserMenu
          user={user}
          textColor="text-white"
          hoverBg={hoverBg}
          buttonVariant={buttonVariant}
          buttonColors={buttonColors}
          isScrolled={isScrolled}
          isMobile={true}
          onActionClick={() => setIsMobileMenuOpen(false)}
          handleProfileClick={handleProfileClick}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      </MobileDrawer>
    </nav>
  );
};

export default Navigation;
