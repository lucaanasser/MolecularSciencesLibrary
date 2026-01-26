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
          {children}
        </div>

        {/* Footer */}
        <div className="absolute left-0 right-0 bottom-0 flex flex-col items-end">
          <hr className="w-[90%] mx-auto border-t border-white/30 mb-2 rounded" />
          <div className="w-[90%] flex justify-center items-center gap-3 mx-auto pb-4">
            <img
              src="/images/logobiblioteca.png"
              alt="Logo da Biblioteca"
              className="h-16 cursor-pointer"
              style={{ maxWidth: '160px', width: 'auto' }}
              onClick={() => {
                onClose();
                navigate('/404');
              }}
            />
            <a
              href="mailto:bibliotecamoleculares@gmail.com"
              className="text-gray-100 font-medium underline-offset-2 cursor-pointer"
              onClick={onClose}
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};