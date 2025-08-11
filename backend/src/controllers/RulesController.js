const RulesService = require('../services/RulesService');

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
        try {
            const { 
                max_days, 
                max_books_per_user, 
                overdue_reminder_days, 
                max_renewals, 
                renewal_days,
                extension_window_days,
                extension_block_multiplier,
                shortened_due_days_after_nudge,
                nudge_cooldown_hours
            } = req.body;
            if ([
                max_days,
                max_books_per_user,
                overdue_reminder_days,
                max_renewals,
                renewal_days,
                extension_window_days,
                extension_block_multiplier,
                shortened_due_days_after_nudge,
                nudge_cooldown_hours
            ].some(v => typeof v !== 'number')) {
                console.warn('🟡 [RulesController] Dados inválidos recebidos:', req.body);
                return res.status(400).json({ error: 'Dados inválidos' });
            }
            const updated = await RulesService.updateRules({ 
                max_days, 
                max_books_per_user, 
                overdue_reminder_days, 
                max_renewals, 
                renewal_days,
                extension_window_days,
                extension_block_multiplier,
                shortened_due_days_after_nudge,
                nudge_cooldown_hours
            });
            console.log('🟢 [RulesController] Regras atualizadas com sucesso');
            res.json(updated);
        } catch (err) {
            console.error('🔴 [RulesController] Erro ao atualizar regras:', err.message);
            res.status(500).json({ error: 'Erro ao atualizar regras', details: err.message });
        }
    }
};

module.exports = RulesController;