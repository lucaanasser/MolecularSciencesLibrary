
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HelpTabsCard from "@/features/forms/HelpTabsCard";

const HelpPageContent = () => (
  <div className="min-h-screen flex flex-col">
    <Navigation />

    {/* Texto introdutório sobre formas de ajudar */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h2>Ajude a Biblioteca</h2>
      <p>
        A Biblioteca conta com o apoio da comunidade para crescer e se manter relevante. 
        Você pode contribuir enviando feedbacks, sugerindo novos livros, doando exemplares ou apoiando financeiramente. 
        Toda ajuda é bem-vinda!
      </p>
    </div>

    <HelpTabsCard />

    <div className="mb-24"></div>
    <Footer />
  </div>
);

export default function HelpPage() {
  return (
    <HelpPageContent />
  );
}
