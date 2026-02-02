import React from "react";

interface HeroSectionProps {
  variant: "library" | "academic";
  children: React.ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ variant, children }) => {
  if (variant === "library") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-library-purple-muted via-library-purple/10 to-default-bg">
        <div className="px-6 md:px-4 lg:px-0 max-w-7xl flex flex-col justify-center items-center">
          <div className="mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8 flex-1">
            {/* Mascote */}
            <div className="flex-1 flex justify-center">
              <img
                src="/images/HeroLibrary.png"
                alt="Mascote Carlos Magno"
                className="w-100 md:w-[40rem] lg:w-[60rem] h-auto"
              />
            </div>
            {/* Conteúdo customizável */}
            <div className="flex-1 flex flex-col items-start">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Variante acadêmica
  return (
    <section className="min-h-screen bg-gradient-to-b from-academic-blue-muted via-academic-blue/10 to-default-bg flex items-center">
      <div className="content-container h-full flex flex-col md:flex-row items-center justify-center w-full">
        {/* Conteúdo customizável */}
        <div className="flex-1 flex flex-col items-center justify-center order-2 md:order-1">
          {children}
        </div>
        {/* Mascote */}
        <div className="flex-[0_0_35%] max-w-[40%] min-w-[180px] flex justify-center order-1 md:order-2 md:mb-0">
          <img
            src="/images/academic1.png"
            alt="Foto Carlos Magno"
            className="w-full h-auto object-contain max-h-[420px]"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
