import { Link, useNavigate } from "react-router-dom";
import { Menu, LogIn, UserCircle, Settings, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { ROUTES } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useHeaderState } from "@/hooks/useHeaderState";
import { link } from "fs";
import { hover } from "framer-motion";

interface MobileNavProps {
  user: User | null;
  headerState: ReturnType<typeof useHeaderState>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ user, headerState }) => {
  const navigate = useNavigate();
  const {
    navLinks,
    showProAlunoHeader,
    textColor,
    hoverBg,
    linkStyle,
    isDrawerVisible,
    drawerBgClass,
    drawerTransition,
    drawerOpenClass,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    navigateToProfile,
    handleLogout,
    getPageLabel,
    isRegularUser,
  } = headerState;



  return (
    <>
      { /* Botão do menu */ }
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn("h-12 w-12 transition-all duration-300", hoverBg)}
          aria-label="Menu"
        >
          <Menu className="h-7 w-7 text-black" />
        </Button>
      </div>

      {isDrawerVisible && (
        <>
        { /* Efeito de menu deslizante */ }
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setIsMobileMenuOpen(false)} />
            <div
              className={cn("relative w-64 max-w-[80vw] h-full shadow-lg transition-transform ease-in-out",  textColor, drawerBgClass, drawerTransition, drawerOpenClass)}
              style={{ willChange: 'transform' }}
            >

              <div className="flex flex-col gap-2 px-4">
                
                { /* Cabeçalho do menu com botão de fechar */ }
                <div className="flex items-center justify-between pt-6">
                  <Button 
                    variant="ghost"
                    size="icon" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn("transition-all duration-300", hoverBg)}
                    aria-label="Fechar menu"
                    >
                    <X className={cn("w-4 h-4", textColor)} />
                  </Button>
                </div>

                { /* Links de navegação */ }
                <div className="space-y-1 flex flex-col">
                  {navLinks.map(link => (
                    <Link 
                      key={link.to} 
                      to={link.to} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className={cn(linkStyle, textColor, hoverBg)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {showProAlunoHeader && (
                    <Link 
                      to={ROUTES.PROALUNO} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className={cn(linkStyle, textColor, hoverBg)}
                    >
                      Portal Pró-Aluno
                    </Link>
                  )}
                </div>
                
                { /* Separador */ }
                <hr className="border-t border-white/30" />
                
                { /* Menu do usuário */ }
                <div className="space-y-1 flex flex-col">
                  {user ? (
                    <>
                      {isRegularUser(user) && (
                        <Link
                          to={ROUTES.MY_PAGE}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn("gap-2", linkStyle, textColor, hoverBg)}
                        >
                          <UserCircle size={18} /> Página Pessoal
                        </Link>
                      )}

                      <Link
                        to="#"
                        onClick={e => { e.preventDefault(); navigateToProfile(); setIsMobileMenuOpen(false); }}
                        className={cn("gap-2", linkStyle, textColor, hoverBg)}
                      >
                        <Settings size={18} /> {getPageLabel(user)}
                      </Link>

                      <Link
                        to="#"
                        onClick={e => { e.preventDefault(); handleLogout(); setIsMobileMenuOpen(false); }}
                        className={cn("gap-2 text-red-600", linkStyle, hoverBg)}
                      >
                        <LogOut size={18} /> Sair
                      </Link>
                      
                    </>
                  ) : (
                    <Link 
                      to={ROUTES.LOGIN} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className={cn("gap-2", linkStyle, textColor, hoverBg)}
                    >
                      <LogIn size={16} /> Entrar
                    </Link>
                  )}
                </div>
              </div>
            </div>
        </div>
      </>
      )}
    </>
  );
};
