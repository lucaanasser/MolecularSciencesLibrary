import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoanForm from "@/features/loans/components/LoanForm";
import ReturnLoanForm from "@/features/loans/components/ReturnLoanForm";

// Log de início de renderização da página Pró-Aluno
console.log("🔵 [ProAlunoPage] Renderizando página Pró-Aluno");

// Implementar lógica de autenticação/autorização para garantir
// que apenas usuários "Pró-Aluno" possam acessar esta página.

const ProAlunoLoanManagement = () => {
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Gerenciamento de Empréstimos (Pró-Aluno)</h2>
      <p className="text-gray-600 mb-6">
        Utilize esta seção para registrar novos empréstimos ou processar devoluções de livros.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Novos Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            {showLoanForm ? (
              <>
                <LoanForm
                  onSuccess={() => {
                    setShowLoanForm(false);
                    // Adicionar feedback de sucesso, se necessário
                  }}
                  // onError para tratamento de erros, se necessário
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowLoanForm(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90 text-white"
                onClick={() => setShowLoanForm(true)}
              >
                Registrar Novo Empréstimo
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Processar Devoluções</CardTitle>
          </CardHeader>
          <CardContent>
            {showReturnForm ? (
              <>
                <ReturnLoanForm
                  onSuccess={() => {
                    setShowReturnForm(false);
                    // Adicionar feedback de sucesso, se necessário
                  }}
                  // onError para tratamento de erros, se necessário
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowReturnForm(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-orange hover:bg-cm-orange/90 text-white"
                onClick={() => setShowReturnForm(true)}
              >
                Processar Devolução
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProAlunoPage = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Simula o carregamento da página
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  if (!isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando página Pró-Aluno...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-cm-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bebas text-cm-black">Portal Pró-Aluno</h1>
            <p className="text-lg text-gray-700 mt-2">
              Bem-vindo! Aqui você pode gerenciar empréstimos e devoluções.
            </p>
          </div>

          {/* Seção de Gerenciamento de Empréstimos para Pró-Aluno */}
          <ProAlunoLoanManagement />

          {/* 
            TODO: Adicionar aqui as outras seções/componentes que são visíveis
            para usuários não logados (ex: busca de livros, lista de livros populares, etc.)
            Exemplo:
            <div className="mt-12">
              <h2 className="text-3xl font-bebas text-center mb-6">Consultar Acervo</h2>
              <SearchBar onSearch={(query) => console.log(query)} />
              <BookList /> 
            </div>
          */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProAlunoPage;