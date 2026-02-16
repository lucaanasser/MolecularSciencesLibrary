const RulesModel = require('../../models/utilities/RulesModel');

const RulesService = {
    
    /**
     * Busca as regras de empréstimo cadastradas no sistema.
     * 
     * @returns {Promise<Object>} Objeto contendo todos os campos de regras de empréstimo.
     * @throws {Error} Caso ocorra erro ao buscar as regras.
     * 
     * Exemplo de retorno:
     * {
     *   max_days: number,                       // Dias máximos para empréstimo
     *   overdue_reminder_days: number,          // Dias para enviar lembrete de atraso
     *   max_books_per_user: number,             // Máximo de livros por usuário
     *   max_renewals: number,                   // Máximo de renovações permitidas
     *   renewal_days: number,                   // Dias adicionados por renovação
     *   extension_window_days: number,          // Janela de dias para extensão
     *   extension_block_multiplier: number,     // Multiplicador de bloqueio por extensão
     *   shortened_due_days_after_nudge: number, // Dias reduzidos após nudge
     *   nudge_cooldown_hours: number,           // Horas de cooldown entre nudges
     *   pending_nudge_extension_days: number    // Dias de extensão pendente após nudge
     * }
     */
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

    /**
     * Atualiza as regras de empréstimo no sistema.
     * 
     * @param {Object} data - Objeto contendo os campos das regras a serem atualizados.
     *   Exemplo: { maxBooks: 5, maxDays: 20 }
     * @returns {Promise<Object[]>} Array de objetos das regras atualizadas.
     * @throws {Error} Caso ocorra erro ao atualizar as regras.
     * 
     * O método atualiza os campos informados e retorna as regras já atualizadas.
     */
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
    },    

    /**
     * ATENÇÃO: MÉTODO AINDA NÃO IMPLEMENTADO!
     * 
     * Propaga novos campos de regras para todos os registros existentes.
     * 
     * @param {Object} data - Objeto contendo os novos campos a serem propagados.
     *   Exemplo: { novoCampo: valor }
     * @returns {Promise<Object[]>} Array de objetos das regras após a propagação dos novos campos.
     * @throws {Error} Caso ocorra erro ao propagar os novos campos.
     * 
     * O método adiciona os novos campos informados a todos os registros de regras existentes.
     */
    propagateNewFields: async (data) => {
        console.log('🔵 [RulesService] Propagando novos campos de regras:', data);
        try {
            await RulesModel.propagateNewFields(data);
            const updated = await RulesModel.getRules();
            console.log('🟢 [RulesService] Novos campos de regras propagados:', updated);
            return updated;
        } catch (err) {
            console.error('🔴 [RulesService] Erro ao propagar novos campos de regras:', err.message);
            throw err;
        }
    },
};

module.exports = RulesService;