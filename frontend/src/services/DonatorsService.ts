import { logger } from "@/utils/logger";

const API_BASE = '/api/donators';

export const DonatorsService = {
  /** Importar doadores via arquivo CSV
   *  @param file: File - arquivo CSV a ser enviado
   *  @returns Promise<Object> - resultado da importação
   */
  importDonatorsFromCSV: async (file: File) => {
    logger.log("🔵 [DonatorsService] Importando doadores via CSV");
    const formData = new FormData();
    formData.append('csvFile', file);

    const userData = localStorage.getItem('user');
    const token = userData ? JSON.parse(userData).token : null;

    try {
      const res = await fetch(`${API_BASE}/import/csv`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro na importação do CSV');
      }
      const data = await res.json();
      logger.log("🟢 [DonatorsService] Importação de doadores concluída:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível importar os doadores.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [DonatorsService] Erro ao importar doadores:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },
};
