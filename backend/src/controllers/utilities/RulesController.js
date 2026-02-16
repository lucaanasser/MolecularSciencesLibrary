const RulesService = require('../../services/utilities/RulesService');
const LOAN_RULES = require('../../utils/validLoanRules').LOAN_RULES;

const RulesController = {
    getRules: async (req, res) => {
        console.log('🔵 [RulesController] Recebida requisição para buscar regras');
        try {
            const rules = await RulesService.getRules();
            console.log('🟢 [RulesController] Regras retornadas com sucesso');
            res.json(rules);
        } catch (err) {
            console.error('🔴 [RulesController] Erro ao buscar regras:', err.message);
            res.status(500).json({ error: 'Erro ao buscar regras', details: err.message });
        }
    },


    updateRules: async (req, res) => {
        console.log('🔵 [RulesController] Recebida requisição para atualizar regras:', req.body);

        // Monta e valida os campos dinamicamente
        const updateData = {};
        for (const field of LOAN_RULES) {
            const value = req.body[field];
            if (typeof value !== 'number') {
                console.warn(`🟡 [RulesController] Campo inválido: ${field} =`, value);
                return res.status(400).json({ error: `Campo inválido: ${field}` });
            }
            updateData[field] = value;
        }

        try {
            const updated = await RulesService.updateRules(updateData);
            console.log('🟢 [RulesController] Regras atualizadas com sucesso');
            res.json(updated);
        } catch (err) {
            console.error('🔴 [RulesController] Erro ao atualizar regras:', err.message);
            res.status(500).json({ error: 'Erro ao atualizar regras', details: err.message });
        }
    }
};

module.exports = RulesController;