import { Link } from "react-router-dom";

/**
 * Rodapé do site.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const Footer: React.FC = () => {
  // Log de início de renderização
  console.log("🔵 [Footer] Renderizando rodapé");
  return (
    <footer className="bg-cm-purple text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bebas mb-4">Biblioteca CM</h3>
            <p className="text-sm text-gray-300">
              Biblioteca do curso de Ciências Moleculares da Universidade de São Paulo.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bebas mb-3">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 hover:text-white">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-gray-300 hover:text-white">
                  Buscar Livros
                </Link>
              </li>
              <li>
                <Link to="/virtual-shelf" className="text-sm text-gray-300 hover:text-white">
                  Estante Virtual
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bebas mb-3">Contato</h4>
            <address className="not-italic text-sm text-gray-300">
              <p>Universidade de São Paulo</p>
              <p>Cidade Universitária</p>
              <p>biblioteca.cm@usp.br</p>
            </address>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Biblioteca Ciências Moleculares. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
