const RulesModel = require('../models/RulesModel');

const RulesService = {
    getRules: async () => {
        console.log('🔵 [RulesService] Buscando regras de empréstimo');
        try {
            const rules = await RulesModel.getRules();
            console.log('🟢 [RulesService] Regras obtidas:', rules);
            return rules;
        } catch (err) {
            console.error('🔴 [RulesService] Erro ao buscar regras:', err.message);
            throw err;
        }
    },

    updateRules: async (data) => {
        console.log('🔵 [RulesService] Atualizando regras:', data);
        try {
            await RulesModel.updateRules(data);
            const updated = await RulesModel.getRules();
            console.log('🟢 [RulesService] Regras atualizadas:', updated);
            return updated;
        } catch (err) {
            console.error('🔴 [RulesService] Erro ao atualizar regras:', err.message);
            throw err;
        }
    }
};

module.exports = RulesService;