import React from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap } from "lucide-react";
import { useSiteMode } from "@/contexts/SiteModeContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/navigation";
import { cn } from "@/lib/utils";

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
    navigate(isAcademico ? ROUTES.HOME : ROUTES.ACADEMIC_HOME);
  };

  const nextMode = isAcademico ? "biblioteca" : "acadêmico";
  
  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-full",
        "transition-all duration-500 ease-in-out cursor-pointer",
        "hover:scale-105 hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "text-white primary-bg"
      )}
      aria-label={`Mudar para modo ${nextMode}`}
      title={`Mudar para modo ${nextMode}`}
    >
      <motion.div
        key={mode}
        initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {isAcademico ? <GraduationCap size={18} /> : <BookOpen size={18} />}
      </motion.div>

      <motion.span
        key={`text-${mode}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-sm font-medium hidden lg:inline"
      >
        {isAcademico ? "Acadêmico" : "Biblioteca"}
      </motion.span>

      {/* Indicador de switch */}
      <div className="relative w-8 h-4 bg-white/30 rounded-full ml-1">
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full shadow-md bg-white"
          animate={{ left: isAcademico ? "calc(100% - 14px)" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

export default ModeSwitcher;
