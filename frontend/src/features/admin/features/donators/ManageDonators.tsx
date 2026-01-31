import { useState } from "react";
import AddDonatorForm from "@/features/admin/features/donators/components/AddDonatorForm";
import DonatorsList from "@/features/admin/features/donators/components/DonatorsList";
import ImportDonators from "@/features/admin/features/donators/components/ImportDonators";
import ActionGrid from "@/features/admin/components/ActionGrid";
import { toast } from "@/components/ui/use-toast";

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
    <>
      {!showList && !showImportCSV && !showAddForm && (
        <>
          <h3>Gerenciamento de Doadores</h3>
          <p>
            Cadastre novos doadores ou visualize doadores já cadastrados no sistema.
            Para importar uma lista de doadores (batch import), utilize a opção "Importar CSV".
          </p>
      
          <ActionGrid
            columns={3}
            actions={[
              {
                label: "Adicionar doador",
                onClick: () => setShowAddForm(true),
                color: "bg-cm-green",
              },
              {
                label: "Ver lista de doadores",
                onClick: () => setShowList(true),
                color: "bg-academic-blue",
              },
              {
                label: "Importar CSV",
                onClick: () => setShowImportCSV(true),
                color: "bg-library-purple",
              },
            ]}
          />
        </>
      )}

      {successMsg && (
        toast({ title: successMsg, variant: "default" })
      )}

      {showAddForm && (
        <AddDonatorForm
          onBack={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            setSuccessMsg("Doador adicionado com sucesso!");
          }}
          onError={(err) => setSuccessMsg(`Erro: ${err.message}`)}
        />
      )}

      {showList && (
        <DonatorsList
          onBack={() => setShowList(false)}
          onExportCSV={handleExportCSV}
        />
      )}

      {showImportCSV && (
        <ImportDonators
          onBack={() => setShowImportCSV(false)}
          onCancel={() => setShowImportCSV(false)}
          onSuccess={(results) => {
            console.log("🟢 [AdminPage/ManageDonators] Importação CSV concluída:", results);
            setShowImportCSV(false);
            setSuccessMsg(`Importação concluída: ${results.success} sucesso, ${results.failed} falhas`);
          }}
          onError={(err) => setSuccessMsg(`Erro: ${err.message}`)}
        />
      )}
    </>
  );
};

export default ManageDonators;
