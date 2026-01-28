import { Link, useNavigate } from "react-router-dom";

interface MobileDrawerProps {
  isDrawerVisible: boolean;
  drawerBgClass: string;
  drawerTransition: string;
  drawerOpenClass: string;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps & { children: React.ReactNode }> = ({
  isDrawerVisible,
  drawerBgClass,
  drawerTransition,
  drawerOpenClass,
  onClose,
  children,
}) => {
  const navigate = useNavigate();

  if (!isDrawerVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose} />
      
      {/* Drawer */}
      <div
        className={`relative w-64 max-w-[80vw] h-full ${drawerBgClass} text-white shadow-lg transition-transform ease-in-out ${drawerTransition} ${drawerOpenClass}`}
        style={{ willChange: 'transform' }}
      >
        {/* Header com botão fechar */}
        <div className="flex items-center justify-between pt-6 pb-2 pl-4 pr-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <span className="text-3xl text-white">×</span>
          </button>
        </div>

        {/* Conteúdo do menu */}
        <div className="pt-2 pb-3 px-4 space-y-1 flex-1 flex flex-col">
          {/* Links principais */}
          {Array.isArray(children) ? (
            <>
              {/* Renderiza todos os links exceto UserMenu (assumindo UserMenu é o último ou penúltimo children) */}
              {children.slice(0, -1)}
              <hr className="mt-2 border-t border-white/30" />
              {/* Renderiza UserMenu (botões pessoais, conta, sair) */}
              {children.slice(-1)}
            </>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};