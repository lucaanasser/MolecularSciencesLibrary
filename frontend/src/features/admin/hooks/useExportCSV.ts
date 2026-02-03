import { useAdminToast } from "@/features/admin/hooks/useAdminToast";

interface UseExportCSVOptions {
  endpoint: string;
  filename?: string;
}

export function useExportCSV({ endpoint, filename }: UseExportCSVOptions) {
  const { showSuccess, showError } = useAdminToast();

  const exportCSV = async () => {
    try {
      console.log("🔵 [ExportCSVWizard] Iniciando exportação CSV");
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Erro ao exportar CSV");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showSuccess("CSV exportado com sucesso!");
      console.log("🟢 [ExportCSVWizard] CSV exportado com sucesso");
    } catch (error) {
      console.error("🔴 [ExportCSVWizard] Erro ao exportar CSV:", error);
      showError("Erro ao exportar CSV");
    }
  };

  return { exportCSV };
}
