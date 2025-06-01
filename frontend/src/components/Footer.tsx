import { Link } from "react-router-dom";

/**
 * Rodapé do site.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const textBaseClass = "text-sm text-black";
const linkBaseClass = `${textBaseClass} hover:text-gray-700`;

const Footer: React.FC = () => {
  // Log de início de renderização
  console.log("🔵 [Footer] Renderizando rodapé");
  return (
    <footer className="bg-cm-bg text-cm-bg py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <img
              src="images/logoestendido.png"
              alt="Logo Biblioteca CM"
              className="h-20 mb-4"
            />
            <p className={textBaseClass}>
              Site desenvolvido com muito amor e carinho por Luca Nasser e Helena Reis, Turma 33. 
            </p>
            {/* Mobile: Links e Contato lado a lado */}
            <div className="grid grid-cols-2 gap-4 mt-6 md:hidden">
              <div>
                <h4 className="text-lg text-black font-bebas mb-3">Links Rápidos</h4>
                <ul>
                  <li>
                    <Link to="/" className={linkBaseClass}>
                      Início
                    </Link>
                  </li>
                  <li>
                    <Link to="/search" className={linkBaseClass}>
                      Buscar Livros
                    </Link>
                  </li>
                  <li>
                    <Link to="/virtual-shelf" className={linkBaseClass}>
                      Estante Virtual
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className={linkBaseClass}>
                      Login
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg text-black font-bebas mb-3">Contato</h4>
                <address className={`not-italic ${textBaseClass}`}>
                  <p>Universidade de São Paulo</p>
                  <p>InovaUSP</p>
                  <p>Cidade Universitária</p>
                  <p>biblioteca.cm@usp.br</p>
                </address>
              </div>
            </div>
          </div>
          {/* Desktop: Links e Contato em colunas separadas */}
          <div className="hidden md:block">
            <h4 className="text-lg text-black font-bebas mb-3">Links Rápidos</h4>
            <ul>
              <li>
                <Link to="/" className={linkBaseClass}>
                  Início
                </Link>
              </li>
              <li>
                <Link to="/search" className={linkBaseClass}>
                  Buscar Livros
                </Link>
              </li>
              <li>
                <Link to="/virtual-shelf" className={linkBaseClass}>
                  Estante Virtual
                </Link>
              </li>
              <li>
                <Link to="/login" className={linkBaseClass}>
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div className="hidden md:block">
            <h4 className="text-lg text-black font-bebas mb-3">Contato</h4>
            <address className={`not-italic ${textBaseClass}`}>
              <p>Universidade de São Paulo</p>
              <p>InovaUSP</p>
              <p>Cidade Universitária</p>
              <p>biblioteca.cm@usp.br</p>
            </address>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;