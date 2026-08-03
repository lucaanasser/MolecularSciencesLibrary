import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FEATURES } from "@/constants/features";
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
  const [mode, setModeState] = useState<SiteMode>(() => {
    // Sem a flag o site é só biblioteca, mesmo que exista modo salvo no localStorage.
    if (!FEATURES.modoAcademico) return "biblioteca";

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "biblioteca" || saved === "academico") {
      return saved;
    }
    return "biblioteca";
  });

  useEffect(() => {
    if (FEATURES.modoAcademico) {
      localStorage.setItem(STORAGE_KEY, mode);
    }

    // Classe no document para os estilos globais de cada modo.
    if (mode === "academico") {
      document.documentElement.classList.add("mode-academico");
      document.documentElement.classList.remove("mode-biblioteca");
    } else {
      document.documentElement.classList.add("mode-biblioteca");
      document.documentElement.classList.remove("mode-academico");
    }

    logger.log(`🔵 [SiteMode] Modo alterado para: ${mode}`);
  }, [mode]);

  const setMode = (newMode: SiteMode) => {
    if (newMode === "academico" && !FEATURES.modoAcademico) return;
    setModeState(newMode);
  };

  const toggleMode = () => {
    if (!FEATURES.modoAcademico) return;
    setModeState((prev) => (prev === "biblioteca" ? "academico" : "biblioteca"));
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
