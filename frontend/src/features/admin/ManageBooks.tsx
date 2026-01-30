import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddBookForm from "@/features/books/components/wizard/AddBookWizard";
import RemoveBookForm from "@/features/books/components/wizard/RemoveBookWizard";
import BooksList from "@/features/books/components/lists/BooksList";
import ImportBooksCSV from "@/features/books/components/modals/ImportBooksCSV";

// ErrorBoundary is expected to be imported from a shared location
import { ErrorBoundary } from "@/features/admin/ErrorBoundary";

const ManageBooks = () => {
  const [selectedTab, setSelectedTab] = useState<"add" | "remove" | "list" | "import" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Livros</h2>
      <p className="text-sm sm:text-base text-gray-600">Aqui você pode adicionar ou remover livros do acervo da biblioteca.</p>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 sm:p-4 rounded-xl my-4 text-sm sm:text-base">
          {error}
          <Button variant="link" onClick={() => setError(null)} className="ml-2 text-xs sm:text-sm">
            Fechar
          </Button>
        </div>
      )}
      {!selectedTab && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Adicionar Livro</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-cm-green hover:bg-cm-green/90 hover:scale-105 text-xs sm:text-sm transition-transform" 
                onClick={() => setSelectedTab("add")}
                disabled={isLoading}
              >
                Adicionar
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Remover Livro</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-cm-red hover:bg-cm-red/90 hover:scale-105 text-sm sm:text-base transition-transform"
                onClick={() => setSelectedTab("remove")}
                disabled={isLoading}
              >
                Remover
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Importar CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 hover:scale-105 text-xs sm:text-sm transition-transform"
                onClick={() => setSelectedTab("import")}
                disabled={isLoading}
              >
                Importar
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Todos os Livros</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-cm-blue hover:bg-cm-blue/90 hover:scale-105 text-xs sm:text-sm transition-transform"
                onClick={() => setSelectedTab("list")}
                disabled={isLoading}
              >
                Ver Todos
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {selectedTab === "add" && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => setSelectedTab(null)}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Adicionar Novo Livro</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <AddBookForm
                  onCancel={() => setSelectedTab(null)}
                  onSuccess={() => {
                    setSelectedTab(null);
                  }}
                  onError={(err) => {
                    setError(err.message || "Erro ao processar a requisição");
                  }}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      )}
      {selectedTab === "remove" && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => setSelectedTab(null)}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Remover Livro</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <RemoveBookForm
                  onCancel={() => setSelectedTab(null)}
                  onSuccess={() => {
                    setSelectedTab(null);
                  }}
                  onError={(err) => {
                    setError(err.message || "Erro ao remover o livro");
                  }}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      )}
      {selectedTab === "import" && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => setSelectedTab(null)}
          >
            Voltar
          </Button>
          <ErrorBoundary>
            <ImportBooksCSV
              onCancel={() => setSelectedTab(null)}
              onSuccess={() => {}}
              onError={(err) => {
                setError(err.message || "Erro ao importar livros");
              }}
            />
          </ErrorBoundary>
        </div>
      )}
      {selectedTab === "list" && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => setSelectedTab(null)}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Todos os Livros</CardTitle>
            </CardHeader>
            <CardContent>
              <BooksList onClose={() => setSelectedTab(null)} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
