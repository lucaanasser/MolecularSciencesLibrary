import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VirtualBookshelf from "@/features/books/components/VirtualBookShelf/VirtualBookshelfPanel";

// Log de início de renderização da página Estante Virtual
console.log("🔵 [VirtualShelfPage] Renderizando página da Estante Virtual");

const VirtualShelfPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-cm-bg overflow-visible">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 w-full">
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
