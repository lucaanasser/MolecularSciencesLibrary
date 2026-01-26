import { Link } from "react-router-dom";

interface NavigationLinksProps {
  navLinks: Array<{ to: string; label: string }>;
  showProAlunoHeader: boolean;
  textColor: string;
  hoverBg: string;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export const NavigationLinks: React.FC<NavigationLinksProps> = ({ 
  navLinks, 
  showProAlunoHeader, 
  textColor, 
  hoverBg, 
  isMobile = false,
  onLinkClick 
}) => {
  const commonLinkClasses = isMobile 
    ? `block px-3 py-2 rounded-md text-white ${hoverBg}`
    : `px-3 py-2 rounded-md ${textColor} ${hoverBg}`;

  return (
    <>
      {navLinks.map((link) => (
        <Link 
          key={link.to} 
          to={link.to} 
          className={commonLinkClasses}
          onClick={onLinkClick}
        >
          {link.label}
        </Link>
      ))}
      {showProAlunoHeader && (
        <Link 
          to="/proaluno" 
          className={isMobile ? `block px-3 py-2 rounded-md font-bold text-white ${hoverBg}` : commonLinkClasses}
          onClick={onLinkClick}
        >
          Portal Pró-Aluno
        </Link>
      )}
    </>
  );
};