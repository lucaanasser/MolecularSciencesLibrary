import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddBookForm from "@/features/admin/books/components/AddBookWizard";
import RemoveBookForm from "@/features/admin/books/components/RemoveBookWizard";
import BooksList from "@/features/admin/books/components/BooksList";
import ImportBooksCSV from "@/features/admin/books/components/ImportBooksCSV";
import { ErrorBoundary } from "@/features/admin/utils/ErrorBoundary";

const ManageBooks = () => {
  const [selectedTab, setSelectedTab] = useState<"add" | "remove" | "list" | "import" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <>
      {!selectedTab && (
        <>
          <h3>Gerenciamento de Livros</h3>
          <p>
            Adicione, remova ou veja todos os livros no acervo. 
            Para adicionar vários livros de uma vez (batch import), escolha a opção "Importar CSV".
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Adicionar livro", tab: "add", color: "bg-cm-green" },
              { label: "Remover livro", tab: "remove", color: "bg-cm-red" },
              { label: "Ver todo o acervo", tab: "list", color: "bg-academic-blue" },
              { label: "Importar CSV", tab: "import", color: "bg-library-purple" },
            ].map(({ label, tab, color }) => (
              <Button
                key={tab}
                variant="wide"
                size="sm"
                className={color}
                onClick={() => setSelectedTab(tab as any)}
                disabled={isLoading}
              >
                {label}
              </Button>
            ))}
          </div>
        </>
      )}
      
      {selectedTab === "add" && (
        <>
          <ErrorBoundary>
            <AddBookForm
              onCancel={() => setSelectedTab(null)}
              onSuccess={() => setSelectedTab(null)}
              onError={(err) => setError(err.message || "Erro ao processar a requisição")}
            />
          </ErrorBoundary>
        </>
      )}

      {selectedTab === "remove" && (
        <>
          <ErrorBoundary>
            <RemoveBookForm
              onCancel={() => setSelectedTab(null)}
              onSuccess={() => setSelectedTab(null)}
              onError={(err) => setError(err.message || "Erro ao remover o livro")}
            />
          </ErrorBoundary>
        </>
      )}

      {selectedTab === "import" && (
        <>
          <ErrorBoundary>
            <ImportBooksCSV
              onCancel={() => setSelectedTab(null)}
              onSuccess={() => {}}
              onError={(err) => setError(err.message || "Erro ao importar livros")}
            />
          </ErrorBoundary>
        </>
      )}

      {selectedTab === "list" && (
        <>
          <BooksList onClose={() => setSelectedTab(null)} />
          <Button variant="default" className="mb-4 rounded-xl" onClick={() => setSelectedTab(null)}>
            Voltar
          </Button>
        </>
      )}
    </>
  );
};

export default ManageBooks;
