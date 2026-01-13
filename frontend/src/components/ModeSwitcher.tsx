import React from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap } from "lucide-react";
import { useSiteMode } from "@/hooks/useSiteMode";
import { useNavigate } from "react-router-dom";

/**
 * Componente de switch para alternar entre modos do site.
 * Possui animação suave e visual distinto para cada modo.
 * Ao trocar de modo, navega automaticamente para a página inicial do modo.
 */
const ModeSwitcher: React.FC = () => {
  const { mode, toggleMode, isAcademico } = useSiteMode();
  const navigate = useNavigate();

  const handleToggle = () => {
    toggleMode();
    // Navega para a página inicial do novo modo
    if (isAcademico) {
      // Está em acadêmico, vai para biblioteca
      navigate("/");
    } else {
      // Está em biblioteca, vai para acadêmico
      navigate("/academico");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-full
        transition-all duration-500 ease-in-out
        border-2 cursor-pointer
        ${isAcademico 
          ? "bg-gradient-to-r from-cm-academic to-cm-academic-light border-cm-academic text-white" 
          : "bg-gradient-to-r from-cm-purple to-cm-purple/80 border-cm-purple text-white"
        }
        hover:scale-105 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isAcademico ? "focus:ring-cm-academic" : "focus:ring-cm-purple"}
      `}
      aria-label={`Mudar para modo ${isAcademico ? "biblioteca" : "acadêmico"}`}
      title={`Mudar para modo ${isAcademico ? "biblioteca" : "acadêmico"}`}
    >
      {/* Ícone animado */}
      <motion.div
        key={mode}
        initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        {isAcademico ? (
          <GraduationCap size={18} className="text-white" />
        ) : (
          <BookOpen size={18} className="text-white" />
        )}
      </motion.div>

      {/* Texto do modo atual */}
      <motion.span
        key={`text-${mode}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-sm font-medium hidden sm:inline"
      >
        {isAcademico ? "Acadêmico" : "Biblioteca"}
      </motion.span>

      {/* Indicador de switch */}
      <div className="relative w-8 h-4 bg-white/30 rounded-full ml-1">
        <motion.div
          className={`absolute top-0.5 w-3 h-3 rounded-full shadow-md ${
            isAcademico ? "bg-white" : "bg-white"
          }`}
          animate={{
            left: isAcademico ? "calc(100% - 14px)" : "2px",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
};

export default ModeSwitcher;
