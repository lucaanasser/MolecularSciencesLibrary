import { Link } from "react-router-dom";
import { useSiteMode } from "@/hooks/useSiteMode";

/**
 * Rodapé do site.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const textBaseClass = "smalltext text-black";
const linkBaseClass = `${textBaseClass} hover:text-gray-700`;

const Footer: React.FC = () => {
  
  const isAcademico = useSiteMode();

  let links = [];
  if (isAcademico) {
    links = [
      { to: "/academico", label: "Início" },
      { to: "/academico/buscar", label: "Buscar" },
      { to: "/academico/grade", label: "Montar Grade" },
      { to: "/academico/forum", label: "Fórum de Dúvidas" },
      { to: "/academico/faq", label: "FAQ" },
      { to: "/entrar", label: "Login" },
    ];
  } else {
    links = [
      { to: "/", label: "Início" },
      { to: "/buscar", label: "Buscar Livros" },
      { to: "/estante", label: "Estante Virtual" },
      { to: "/ajude", label: "Ajude a Biblioteca" },
      { to: "/faq", label: "FAQ" },
      { to: "/entrar", label: "Login" },
    ];
  };

  const contato = [
    "Universidade de São Paulo",
    "InovaUSP",
    "Cidade Universitária",
    "bibliotecamoleculares@gmail.com",
  ];

  // Log de início de renderização
  console.log("🔵 [Footer] Renderizando rodapé");
  
  return (
    <footer className="bg-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-x-10 md:[grid-template-columns:1.2fr_0.8fr_1fr]">
          {/* Logo/texto */}
          <div>
            <img
              src="/images/logos/logoHorizontal.png"
              alt="Logo Biblioteca CM"
              className="h-20 mb-4"
            />
            <p className={textBaseClass}>
              Site desenvolvido com muito amor e carinho por Luca Marinho e Helena Reis, Turma 33.
            </p>
          </div>
          {/* Links */}
          <div>
            <h4>Links Rápidos</h4>
            <ul>
              {links.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className={linkBaseClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contato*/}
          <div className="sm:col-span-2 md:col-span-1">
            <h4>Contato</h4>
            <ul className="space-y-1">
              {contato.map((item, idx) => (
                <li className={`${textBaseClass} mb-0`} key={idx} > {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;