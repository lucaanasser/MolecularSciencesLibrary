import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * Modos do site:
 * - "biblioteca": Modo padrão da biblioteca (roxo/rosa)
 * - "academico": Modo acadêmico para ciclo avançado (azul/verde-água)
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
    // Recupera o modo salvo no localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "biblioteca" || saved === "academico") {
      return saved;
    }
    return "biblioteca";
  });

  useEffect(() => {
    // Salva o modo no localStorage
    localStorage.setItem(STORAGE_KEY, mode);
    
    // Adiciona classe no document para estilos globais
    if (mode === "academico") {
      document.documentElement.classList.add("mode-academico");
      document.documentElement.classList.remove("mode-biblioteca");
    } else {
      document.documentElement.classList.add("mode-biblioteca");
      document.documentElement.classList.remove("mode-academico");
    }
    
    console.log(`🔵 [SiteMode] Modo alterado para: ${mode}`);
  }, [mode]);

  const setMode = (newMode: SiteMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
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
