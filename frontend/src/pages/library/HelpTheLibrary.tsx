

import Navigation from "@/components/Header";
// import Footer from "@/components/Footer";
import HelpTabsCard from "@/features/forms/HelpTabsCard";
import { PageContainer } from "@/lib/PageContainer";

const HelpPageContent = () => (
  <div className="min-h-screen flex flex-col">
    
    <div className="flex-grow">
      <PageContainer>
        <h2>Ajude a Biblioteca</h2>
        <p>
          A Biblioteca conta com o apoio da comunidade para crescer e se manter relevante. 
          Você pode contribuir enviando feedbacks, sugerindo novos livros, doando exemplares ou apoiando financeiramente. 
          Toda ajuda é bem-vinda!
        </p>
        <HelpTabsCard />
        <div className="mb-24"></div>
      </PageContainer>
    </div>
    {/* Footer removido, agora está no layout global */}
  </div>
);

export default function HelpPage() {
  return (
    <HelpPageContent />
  );
}
