import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VirtualBookshelf from "@/features/books/components/VirtualBookShelf/VirtualBookshelfPanel";

// Log de início de renderização da página Estante Virtual
console.log("🔵 [VirtualShelfPage] Renderizando página da Estante Virtual");

const VirtualShelfPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-default-bg overflow-visible">
        <div className="max-w-7xl mx-auto w-full">
          {/* Wrapper extra para responsividade */}
          <div className="w-full">
            <VirtualBookshelf />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VirtualShelfPage;
