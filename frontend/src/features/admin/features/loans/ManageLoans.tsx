import { useState } from "react";
import ActionGrid from "@/features/admin/components/ActionGrid";
import LoanRegister from "@/features/admin/features/loans/features/LoanRegister";
import ActiveLoansList from "@/features/admin/features/loans/features/ActiveLoansList";
import InternalUse from "@/features/admin/features/loans/features/InternalUse";

const ManageLoans = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [internalUseCode, setInternalUseCode] = useState("");
  const [internalUseLoading, setInternalUseLoading] = useState(false);
  const [internalUseError, setInternalUseError] = useState("");
  const [internalUseSuccess, setInternalUseSuccess] = useState("");

  // Log de início de renderização do gerenciamento de empréstimos
  console.log("🔵 [AdminPage/ManageLoans] Renderizando gerenciamento de empréstimos");


  const handleLoanSuccess = () => {
    setSelectedTab(null);
    setRefreshKey(prev => prev + 1); // Força recarregar a lista
    console.log("🟢 [AdminPage/ManageLoans] Empréstimo registrado com sucesso");
  };

  const handleInternalUse = async () => {
    if (!internalUseCode) {
      setInternalUseError("Informe o código do livro");
      return;
    }

    setInternalUseLoading(true);
    setInternalUseError("");
    setInternalUseSuccess("");

    try {
      const res = await fetch("/api/loans/internal-use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_code: internalUseCode })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao registrar uso interno");
      }

      setInternalUseSuccess("Uso interno registrado com sucesso!");
      setInternalUseCode("");
      setTimeout(() => {
        setInternalUseSuccess("");
      }, 3000);
      console.log("🟢 [AdminPage/ManageLoans] Uso interno registrado");
    } catch (err: any) {
      setInternalUseError(err.message);
      console.error("🔴 [AdminPage/ManageLoans] Erro ao registrar uso interno:", err);
    } finally {
      setInternalUseLoading(false);
    }
  };      

    return (
    <>
      {!selectedTab && (
        <>
          <h3>Gerenciamento de Empréstimos</h3>
          <p>Gerencie empréstimos e visualize todos os empréstimos ativos.</p>
          <>
            <ActionGrid
              actions={[
                {
                  label: "Registrar empréstimo/devolução",
                  onClick: () => {
                    console.log("🔵 [AdminPage/ManageLoans] Selecionado: Registrar Empréstimo");
                    setSelectedTab("loan");
                  },
                  color: "bg-cm-green",
                },
                {
                  label: "Registrar Uso Interno",
                  onClick: () => {
                    console.log("🔵 [AdminPage/ManageLoans] Selecionado: Uso Interno");
                    setSelectedTab("internal");
                  },
                  color: "bg-library-purple",
                },
                {
                  label: "Ver Empréstimos Ativos",
                  onClick: () => {
                    console.log("🔵 [AdminPage/ManageLoans] Selecionado: Ver Empréstimos Ativos");
                    setSelectedTab("list");
                  },
                  color: "bg-academic-blue",
                },
              ]}
              columns={3}
            />
          </>
        </>
      )}
    
      {selectedTab === "loan" && (
        <LoanRegister onBack={() => setSelectedTab(null)} onSuccess={handleLoanSuccess} />
      )}
    
      {selectedTab === "list" && (
        <ActiveLoansList onBack={() => setSelectedTab(null)} />
      )}
    
      {selectedTab === "internal" && (
        <InternalUse onBack={() => setSelectedTab(null)} />
      )}
    </>
  );
};

export default ManageLoans;
