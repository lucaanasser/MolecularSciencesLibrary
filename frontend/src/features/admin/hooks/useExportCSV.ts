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
      // A exportação de usuários exige token de admin no backend; sem o header
      // a rota responde 401 e o download vem vazio.
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;
      const response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
