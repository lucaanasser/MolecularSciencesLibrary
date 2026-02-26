/*
 * Serviço para operações de regras de empréstimo
 * Centraliza as chamadas à API relacionadas às regras de empréstimo.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

import { logger } from "@/utils/logger";
import { fetchJson } from "@/utils/fetchJson";

const API_BASE = '/api/rules';

export const RulesService = {
  /* Buscar regras de empréstimo */
  getRules: async () => {
    logger.log("🔵 [RulesService] Buscando regras de empréstimo");
    try {
      const data = await fetchJson(`${API_BASE}`, { method: 'GET' });
      logger.log("🟢 [RulesService] Regras obtidas:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar as regras de empréstimo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [RulesService] Erro ao buscar regras de empréstimo", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Atualizar regras de empréstimo */
  updateRules: async (rulesData: Record<string, number>) => {
    logger.log("🔵 [RulesService] Atualizando regras de empréstimo:", rulesData);
    try {
      const data = await fetchJson(`${API_BASE}`, {
        method: 'PUT',
        body: JSON.stringify(rulesData),
      });
      logger.log("🟢 [RulesService] Regras atualizadas:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível atualizar as regras de empréstimo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [RulesService] Erro ao atualizar regras de empréstimo", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },
};