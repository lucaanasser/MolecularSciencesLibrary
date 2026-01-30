import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DonatorForm from "@/features/donators/components/DonatorForm";
import DonatorsList from "@/features/donators/components/DonatorsList";
import ImportDonatorsCSV from "@/features/donators/components/ImportDonatorsCSV";

const ManageDonators = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/donators/export/csv');
      if (!response.ok) throw new Error('Erro ao exportar CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doadores_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccessMsg('CSV exportado com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      setSuccessMsg('Erro ao exportar CSV');
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Doadores</h2>
      <p className="text-sm sm:text-base text-gray-600">Cadastre, busque ou visualize doadores do sistema.</p>
      
      {!showList && !showImportCSV && !showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          {/* Adicionar Doador */}
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Adicionar Doador</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90 text-xs sm:text-sm"
                onClick={() => setShowAddForm(true)}
              >
                Adicionar
              </Button>
            </CardContent>
          </Card>
          
          {/* Lista de Doadores */}
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Lista de Doadores</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-cm-blue hover:bg-cm-blue/90 text-xs sm:text-sm"
                onClick={() => setShowList(true)}
              >
                Ver Todos
              </Button>
            </CardContent>
          </Card>
          
          {/* Importar CSV */}
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Importar CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-library-purple hover:bg-library-purple/90 text-xs sm:text-sm"
                onClick={() => setShowImportCSV(true)}
              >
                Importar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs sm:text-sm">
          {successMsg}
        </div>
      )}

      {/* Formulário de adicionar doador */}
      {showAddForm && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => setShowAddForm(false)}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Adicionar Doador</CardTitle>
            </CardHeader>
            <CardContent>
              <DonatorForm
                onSuccess={() => {
                  setShowAddForm(false);
                  setSuccessMsg("Doador adicionado com sucesso!");
                }}
                onError={(err) => setSuccessMsg(`Erro: ${err.message}`)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de doadores */}
      {showList && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => setShowList(false)}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Todos os Doadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2"
                >
                  Exportar CSV
                </Button>
              </div>
              <DonatorsList />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Importar CSV */}
      {showImportCSV && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => setShowImportCSV(false)}
          >
            Voltar
          </Button>
          <ImportDonatorsCSV
            onCancel={() => setShowImportCSV(false)}
            onSuccess={(results) => {
              console.log("🟢 [AdminPage/ManageDonators] Importação CSV concluída:", results);
              setShowImportCSV(false);
              setSuccessMsg(`Importação concluída: ${results.success} sucesso, ${results.failed} falhas`);
            }}
            onError={(err) => setSuccessMsg(`Erro: ${err.message}`)}
          />
        </div>
      )}
    </div>
  );
};

export default ManageDonators;
