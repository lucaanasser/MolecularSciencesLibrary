import HelpTabsCard from "@/features/forms/HelpTabsCard";

const HelpPageContent = () => (
  <div className="content-container">
    <h2>Ajude a Biblioteca</h2>
    <p>
      A Biblioteca conta com o apoio da comunidade para crescer e se manter relevante. 
      Você pode contribuir enviando feedbacks, sugerindo novos livros, doando exemplares ou apoiando financeiramente. 
      Toda ajuda é bem-vinda!
    </p>
    <HelpTabsCard />
  </div>
);

export default function HelpPage() {
  return (
    <HelpPageContent />
  );
}
