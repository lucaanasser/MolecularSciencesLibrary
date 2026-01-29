import VirtualBookshelf from "@/features/books/components/virtualShelf/VirtualBookshelfPanel";

// Log de início de renderização da página Estante Virtual
console.log("🔵 [VirtualShelfPage] Renderizando página da Estante Virtual");

const VirtualShelfPage = () => {
  return (
    <div className="content-container">
        <VirtualBookshelf />      
    </div>
  );
};

export default VirtualShelfPage;
