import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente reutilizável para padronizar o container principal das páginas.
 * Inclui espaçamentos, largura máxima e responsividade.
 */
export const PageContainer: React.FC<PageContainerProps> = ({ children, className = "" }) => (
  <div
    className={`min-h-[calc(100vh-6rem)] max-w-7xl mx-auto px-4 sm:px-8 lg:px-20 xl:px-32 py-8 lg:py-16 w-full ${className}`}
    style={{ boxSizing: 'border-box' }}
  >
    {children}
  </div>
);

export default PageContainer;
