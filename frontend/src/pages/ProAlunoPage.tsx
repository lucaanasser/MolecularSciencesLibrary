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
  onScanComplete: (nusp: string, codigoLivro: string, senha: string) => void;
  actionLabel: string;
}) => {
  const [nusp, setNusp] = useState("");
  const [senha, setSenha] = useState("");
  const [codigoLivro, setCodigoLivro] = useState("");
  const [step, setStep] = useState<"nusp" | "senha" | "livro">("nusp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nuspInputRef = React.useRef<HTMLInputElement>(null);
  const senhaInputRef = React.useRef<HTMLInputElement>(null);
  const livroInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError("");
    if (step === "nusp" && nuspInputRef.current) nuspInputRef.current.focus();
    if (step === "senha" && senhaInputRef.current) senhaInputRef.current.focus();
    if (step === "livro" && livroInputRef.current) livroInputRef.current.focus();
  }, [step]);

  // Mock das funções de validação (substitua por chamadas reais à API)
  async function validarNusp(nusp: string) {
    setLoading(true);
    try {
      // Busca usuário pelo NUSP
      const res = await fetch(`/api/users/${nusp}`);
      setLoading(false);
      if (res.ok) {
        const usuario = await res.json();
        return !!usuario && usuario.NUSP == nusp;
      }
      return false;
    } catch (err) {
      setLoading(false);
      return false;
    }
  }

  async function validarSenha(nusp: string, senha: string) {
    setLoading(true);
    try {
      // Autentica usuário pelo NUSP e senha
      const res = await fetch(`/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NUSP: nusp, password: senha })
      });
      setLoading(false);
      if (res.ok) {
        const data = await res.json();
        return !!data && data.token;
      }
      return false;
    } catch (err) {
      setLoading(false);
      return false;
    }
  }

  async function validarLivro(codigoLivro: string) {
    setLoading(true);
    try {
      // Busca livro pelo código/id
      const res = await fetch(`/api/books/${codigoLivro}`);
      setLoading(false);
      if (res.ok) {
        const livro = await res.json();
        // Verifica se está disponível para empréstimo
        return !!livro && livro.available !== false;
      }
      return false;
    } catch (err) {
      setLoading(false);
      return false;
    }
  }

  const handleNext = async () => {
    setError("");
    if (step === "nusp" && nusp.trim()) {
      const valido = await validarNusp(nusp.trim());
      if (valido) {
        setStep("senha");
      } else {
        setError("NUSP não encontrado.");
      }
    } else if (step === "senha" && senha.trim()) {
      const valido = await validarSenha(nusp.trim(), senha.trim());
      if (valido) {
        setStep("livro");
      } else {
        setError("Senha incorreta.");
      }
    } else if (step === "livro" && codigoLivro.trim()) {
      const disponivel = await validarLivro(codigoLivro.trim());
      if (disponivel) {
        onScanComplete(nusp.trim(), codigoLivro.trim(), senha.trim());
        setNusp("");
        setSenha("");
        setCodigoLivro("");
        setStep("nusp");
      } else {
        setError("Livro não disponível para empréstimo.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNext();
  };

  return (
    <div className="mb-4">
      {step === "nusp" && (
        <>
          <label className="block mb-2 font-medium">Digite ou escaneie seu NUSP:</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full mb-2"
            value={nusp}
            onChange={(e) => setNusp(e.target.value)}
            placeholder="NUSP"
            ref={nuspInputRef}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button className="w-full" onClick={handleNext} disabled={!nusp.trim() || loading}>
            Próximo
          </Button>
        </>
      )}
      {step === "senha" && (
        <>
          <label className="block mb-2 font-medium">Digite sua senha:</label>
          <input
            type="password"
            className="border rounded px-3 py-2 w-full mb-2"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            ref={senhaInputRef}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button className="w-full" onClick={handleNext} disabled={!senha.trim() || loading}>
            Próximo
          </Button>
        </>
      )}
      {step === "livro" && (
        <>
          <label className="block mb-2 font-medium">Digite ou escaneie o código do livro:</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full mb-2"
            value={codigoLivro}
            onChange={(e) => setCodigoLivro(e.target.value)}
            placeholder="Código de barras do livro"
            ref={livroInputRef}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button className="w-full" onClick={handleNext} disabled={!codigoLivro.trim() || loading}>
            {actionLabel}
          </Button>
        </>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

const ProAlunoLoanManagement = () => {
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanData, setScanData] = useState<{ nusp: string; codigoLivro: string; senha: string } | null>(null);

  useEffect(() => {
    if (!showLoanForm && !showReturnForm) {
      setScanCompleted(false);
      setScanData(null);
    }
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
              scanCompleted && scanData ? (
                <>
                  <LoanForm
                    nusp={scanData.nusp}
                    codigoLivro={scanData.codigoLivro}
                    senha={scanData.senha}
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
                  onScanComplete={(nusp, codigoLivro, senha) => {
                    setScanData({ nusp, codigoLivro, senha });
                    setScanCompleted(true);
                  }}
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