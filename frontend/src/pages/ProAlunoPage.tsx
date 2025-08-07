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

const ScanSection = ({
  onScanComplete,
  actionLabel,
}: {
  onScanComplete: (nusp: string, codigoLivro: string) => void;
  actionLabel: string;
}) => {
  const [nusp, setNusp] = useState("");
  const [codigoLivro, setCodigoLivro] = useState("");
  const [step, setStep] = useState<"nusp" | "livro">("nusp");

  // Adiciona refs para inputs
  const nuspInputRef = React.useRef<HTMLInputElement>(null);
  const livroInputRef = React.useRef<HTMLInputElement>(null);

  // Foca automaticamente no input correto ao mudar de passo
  useEffect(() => {
    if (step === "nusp" && nuspInputRef.current) {
      nuspInputRef.current.focus();
    } else if (step === "livro" && livroInputRef.current) {
      livroInputRef.current.focus();
    }
  }, [step]);

  const handleNext = () => {
    if (step === "nusp" && nusp.trim()) {
      setStep("livro");
    } else if (step === "livro" && codigoLivro.trim()) {
      onScanComplete(nusp, codigoLivro);
      setNusp("");
      setCodigoLivro("");
      setStep("nusp");
    }
  };

  return (
    <div className="mb-4">
      {step === "nusp" ? (
        <>
          <label className="block mb-2 font-medium">Escaneie seu NUSP:</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full mb-2"
            value={nusp}
            onChange={(e) => setNusp(e.target.value)}
            placeholder="NUSP"
            ref={nuspInputRef}
          />
          <Button className="w-full" onClick={handleNext} disabled={!nusp.trim()}>
            Próximo
          </Button>
        </>
      ) : (
        <>
          <label className="block mb-2 font-medium">Escaneie o código de barras do livro:</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full mb-2"
            value={codigoLivro}
            onChange={(e) => setCodigoLivro(e.target.value)}
            placeholder="Código de barras do livro"
            ref={livroInputRef}
          />
          <Button className="w-full" onClick={handleNext} disabled={!codigoLivro.trim()}>
            {actionLabel}
          </Button>
        </>
      )}
    </div>
  );
};

const ProAlunoLoanManagement = () => {
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);

  // Reset scanCompleted when closing forms
  useEffect(() => {
    if (!showLoanForm && !showReturnForm) setScanCompleted(false);
  }, [showLoanForm, showReturnForm]);

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
              scanCompleted ? (
                <>
                  <LoanForm
                    onSuccess={() => {
                      setShowLoanForm(false);
                    }}
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
                <ScanSection
                  actionLabel="Registrar Empréstimo"
                  onScanComplete={() => setScanCompleted(true)}
                />
              )
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
              scanCompleted ? (
                <>
                  <ReturnLoanForm
                    onSuccess={() => {
                      setShowReturnForm(false);
                    }}
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
                <ScanSection
                  actionLabel="Processar Devolução"
                  onScanComplete={() => setScanCompleted(true)}
                />
              )
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

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProAlunoPage;