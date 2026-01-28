
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VirtualBookshelf from "@/features/books/components/virtualShelf/VirtualBookshelfPanel";
import { PageContainer } from "@/lib/PageContainer";

// Log de início de renderização da página Estante Virtual
console.log("🔵 [VirtualShelfPage] Renderizando página da Estante Virtual");

const VirtualShelfPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-default-bg overflow-visible">
        <PageContainer>
          <VirtualBookshelf />
        </PageContainer>
      </div>
      <Footer />
    </div>
  );
};

export default VirtualShelfPage;
