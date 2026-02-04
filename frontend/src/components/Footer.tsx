import { Link } from "react-router-dom";
import { useSiteMode } from "@/contexts/SiteModeContext";
import { LIBRARY_NAV_LINKS, ACADEMIC_NAV_LINKS, ROUTES, CONTACT_INFO } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

/**
 * Rodapé do site.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const textStyle = "prose-sm text-black mb-0";
const linkStyle = cn("hover:text-gray-700", textStyle);

const Footer: React.FC = () => {
  
  const { isAcademico } = useSiteMode();

  const links = isAcademico 
    ? [...ACADEMIC_NAV_LINKS, { to: ROUTES.LOGIN, label: "Login" }]
    : [...LIBRARY_NAV_LINKS, { to: ROUTES.LOGIN, label: "Login" }];

  // Log de início de renderização
  logger.info("🔵 [Footer] Renderizando rodapé");
  
  return (
    <footer className="bg-gray-200 py-6">
      <div className="content-container py-0 px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-x-10 md:[grid-template-columns:1.2fr_0.8fr_1fr]">
          
          {/* Logo / texto */}
          <div>
            <img
              src="/images/logos/logoHorizontal.png"
              alt="Logo Biblioteca CM"
              className="h-20 mb-4"
            />
            <p className={textStyle}>
              Site desenvolvido com muito amor e carinho por Luca Marinho e Helena Reis, Turma 33.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4>Links Rápidos</h4>
            <ul>
              {links.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className={linkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contato*/}
          <div className="sm:col-span-2 md:col-span-1">
            <h4>Contato</h4>
            <address className="not-italic space-y-1">
              <p className={textStyle}>{CONTACT_INFO.organization}</p>
              <p className={textStyle}>{CONTACT_INFO.department}</p>
              <p className={textStyle}>{CONTACT_INFO.location}</p>
              <a 
                href={`mailto:${CONTACT_INFO.email}`}
                className={linkStyle}
                aria-label="Enviar email para a biblioteca"
              >
                {CONTACT_INFO.email}
              </a>
            </address>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;