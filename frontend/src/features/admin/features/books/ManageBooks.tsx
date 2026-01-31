import { useState } from "react";
import { Button } from "@/components/ui/button";
import ActionGrid from "@/features/admin/components/ActionGrid";
import AddBookForm from "@/features/admin/features/books/components/AddBookWizard";
import RemoveBookForm from "@/features/admin/features/books/components/RemoveBookWizard";
import BooksList from "@/features/admin/features/books/components/BooksList";
import ImportBooksCSV from "@/features/admin/features/books/components/ImportBooksCSV";
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
          <ActionGrid
            columns={4}
            actions={[
              {
                label: "Adicionar livro",
                onClick: () => setSelectedTab("add"),
                color: "bg-cm-green",
                disabled: isLoading,
              },
              {
                label: "Remover livro",
                onClick: () => setSelectedTab("remove"),
                color: "bg-cm-red",
                disabled: isLoading,
              },
              {
                label: "Ver todo o acervo",
                onClick: () => setSelectedTab("list"),
                color: "bg-academic-blue",
                disabled: isLoading,
              },
              {
                label: "Importar CSV",
                onClick: () => setSelectedTab("import"),
                color: "bg-library-purple",
                disabled: isLoading,
              },
            ]}
          />
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
