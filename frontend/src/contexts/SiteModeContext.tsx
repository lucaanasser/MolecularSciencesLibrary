import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { logger } from "@/utils/logger";

/**
 * Modos do site:
 * - "biblioteca": Modo padrão da biblioteca (roxo)
 * - "academico": Modo acadêmico para ciclo avançado (azul)
 */
export type SiteMode = "biblioteca" | "academico";

interface SiteModeContextType {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
  toggleMode: () => void;
  isAcademico: boolean;
  isBiblioteca: boolean;
}

const SiteModeContext = createContext<SiteModeContextType | undefined>(undefined);

const STORAGE_KEY = "cm-site-mode";

export const SiteModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SiteMode>("biblioteca");

  useEffect(() => {
    // Modo acadêmico temporariamente desativado em produção.
    document.documentElement.classList.add("mode-biblioteca");
    document.documentElement.classList.remove("mode-academico");
    
    logger.log(`🔵 [SiteMode] Modo alterado para: ${mode}`);
  }, [mode]);

  const setMode = (newMode: SiteMode) => {
    if (newMode === "biblioteca") {
      setModeState("biblioteca");
    }
  };

  const toggleMode = () => {
    // Alternância desativada enquanto somente o modo biblioteca estiver em produção.
  };

  return (
    <SiteModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isAcademico: mode === "academico",
        isBiblioteca: mode === "biblioteca",
      }}
    >
      {children}
    </SiteModeContext.Provider>
  );
};

export const useSiteMode = (): SiteModeContextType => {
  const context = useContext(SiteModeContext);
  if (!context) {
    throw new Error("useSiteMode deve ser usado dentro de um SiteModeProvider");
  }
  return context;
};

export default useSiteMode;
