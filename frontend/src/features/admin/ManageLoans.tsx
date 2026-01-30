import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoanForm from "@/features/loans/components/LoanForm";
import ActiveLoansList from "@/features/loans/components/ActiveLoansList";

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
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Empréstimos</h2>
      <p className="text-sm sm:text-base text-gray-600">Gerencie empréstimos e visualize todos os empréstimos ativos.</p>
        {!selectedTab && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            {/* Empréstimo/Devolução */}
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base md:text-lg">Empréstimo/Devolução</CardTitle>
                </CardHeader>
                <CardContent>
                <Button
                    className="w-full bg-cm-green hover:bg-cm-green/90 text-xs sm:text-sm"
                    onClick={() => {
                    console.log("🔵 [AdminPage/ManageLoans] Selecionado: Registrar Empréstimo");
                    setSelectedTab("loan");
                    }}
                >
                    Registrar
                </Button>
                </CardContent>
            </Card>
    
            {/* Lista de Empréstimos Ativos */}
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base md:text-lg">Empréstimos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                <Button
                    className="w-full bg-cm-blue hover:bg-cm-blue/90 text-xs sm:text-sm"
                    onClick={() => {
                    console.log("🔵 [AdminPage/ManageLoans] Selecionado: Ver Empréstimos Ativos");
                    setSelectedTab("list");
                    }}
                >
                    Ver Todos
                </Button>
                </CardContent>
            </Card>
    
            {/* Uso Interno */}
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base md:text-lg">Uso Interno</CardTitle>
                </CardHeader>
                <CardContent>
                <Button
                    className="w-full bg-library-purple hover:bg-library-purple/90 text-xs sm:text-sm"
                    onClick={() => {
                    console.log("🔵 [AdminPage/ManageLoans] Selecionado: Uso Interno");
                    setSelectedTab("internal");
                    }}
                >
                    Registrar Uso
                </Button>
                </CardContent>
            </Card>
            </div>
        )}
    
        {selectedTab === "loan" && (
            <div className="mt-6">
            <Button 
                variant="outline" 
                className="mb-4 rounded-xl" 
                onClick={() => {
                console.warn("🟡 [AdminPage/ManageLoans] Voltar do formulário de empréstimo");
                setSelectedTab(null);
                }}
            >
                Voltar
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                <CardTitle className="text-xl">Empréstimo/Devolução</CardTitle>
                </CardHeader>
                <CardContent>
                <LoanForm 
                    isAdminMode={true}
                    onSuccess={handleLoanSuccess} 
                />
                </CardContent>
            </Card>
            </div>
        )}
    
        {selectedTab === "list" && (
            <div className="mt-6">
            <Button 
                variant="outline" 
                className="mb-4 rounded-xl" 
                onClick={() => {
                console.warn("🟡 [AdminPage/ManageLoans] Voltar da lista de empréstimos");
                setSelectedTab(null);
                }}
            >
                Voltar
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                <CardTitle className="text-xl">Empréstimos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                <ActiveLoansList key={refreshKey} onClose={() => setSelectedTab(null)} />
                </CardContent>
            </Card>
            </div>
        )}
    
        {selectedTab === "internal" && (
            <div className="mt-6">
            <Button 
                variant="outline" 
                className="mb-4 rounded-xl" 
                onClick={() => {
                console.warn("🟡 [AdminPage/ManageLoans] Voltar do uso interno");
                setSelectedTab(null);
                setInternalUseCode("");
                setInternalUseError("");
                setInternalUseSuccess("");
                }}
            >
                Voltar
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                <CardTitle className="text-xl">Uso Interno</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                    Registre livros usados internamente na biblioteca (sem empréstimo externo)
                    </p>
                    <div>
                    <label className="text-sm font-medium">Código do Livro:</label>
                    <Input
                        type="text"
                        value={internalUseCode}
                        onChange={(e) => setInternalUseCode(e.target.value)}
                        placeholder="Ex: 123"
                        disabled={internalUseLoading}
                        onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            handleInternalUse();
                        }
                        }}
                    />
                    </div>
                    {internalUseError && (
                    <div className="text-red-600 text-sm">{internalUseError}</div>
                    )}
                    {internalUseSuccess && (
                    <div className="text-green-600 text-sm">{internalUseSuccess}</div>
                    )}
                    <Button
                    className="w-full bg-library-purple hover:bg-library-purple/90"
                    onClick={handleInternalUse}
                    disabled={internalUseLoading}
                    >
                    {internalUseLoading ? "Registrando..." : "Registrar"}
                    </Button>
                </div>
                </CardContent>
            </Card>
            </div>
        )}
    </div>
  );
};

export default ManageLoans;
