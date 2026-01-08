// DisciplinesController gerencia as operações de controle para disciplinas da USP,
// conectando as rotas aos serviços.
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const disciplinesService = require('../services/DisciplinesService');

class DisciplinesController {
    constructor() {
        // Inicializações ou configurações do controller, se necessário
    }

    /**
     * Busca disciplinas com filtros opcionais
     * GET /api/disciplines
     */
    async getDisciplines(req, res) {
        try {
            console.log(`🔵 [DisciplinesController] Buscando disciplinas`);
            const { campus, unidade, search, limit, offset } = req.query;
            
            const filters = {
                campus: campus || null,
                unidade: unidade || null,
                searchTerm: search || null,
                limit: limit ? parseInt(limit) : null,
                offset: offset ? parseInt(offset) : null
            };

            const disciplines = await disciplinesService.getDisciplines(filters);
            console.log(`🟢 [DisciplinesController] ${disciplines.length} disciplinas encontradas`);
            res.json(disciplines);
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao buscar disciplinas:", error.message);
            res.status(500).json({ error: 'Erro ao buscar disciplinas' });
        }
    }

    /**
     * Busca uma disciplina por código
     * GET /api/disciplines/:codigo
     */
    async getDisciplineByCodigo(req, res) {
        try {
            const { codigo } = req.params;
            console.log(`🔵 [DisciplinesController] Buscando disciplina: ${codigo}`);
            
            const discipline = await disciplinesService.getDisciplineByCodigo(codigo);
            
            if (!discipline) {
                console.warn(`🟡 [DisciplinesController] Disciplina não encontrada: ${codigo}`);
                return res.status(404).json({ error: 'Disciplina não encontrada' });
            }
            
            console.log(`🟢 [DisciplinesController] Disciplina encontrada: ${codigo}`);
            res.json(discipline);
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao buscar disciplina:", error.message);
            res.status(500).json({ error: 'Erro ao buscar disciplina' });
        }
    }

    /**
     * Busca disciplina completa com turmas, horários e professores
     * GET /api/disciplines/:codigo/full
     */
    async getFullDiscipline(req, res) {
        try {
            const { codigo } = req.params;
            console.log(`🔵 [DisciplinesController] Buscando disciplina completa: ${codigo}`);
            
            const discipline = await disciplinesService.getFullDiscipline(codigo);
            
            if (!discipline) {
                console.warn(`🟡 [DisciplinesController] Disciplina não encontrada: ${codigo}`);
                return res.status(404).json({ error: 'Disciplina não encontrada' });
            }
            
            console.log(`🟢 [DisciplinesController] Disciplina completa encontrada: ${codigo}`);
            res.json(discipline);
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao buscar disciplina completa:", error.message);
            res.status(500).json({ error: 'Erro ao buscar disciplina' });
        }
    }

    /**
     * Lista todos os campi disponíveis
     * GET /api/disciplines/campi
     */
    async getCampi(req, res) {
        try {
            console.log(`🔵 [DisciplinesController] Buscando campi`);
            const campi = await disciplinesService.getCampi();
            console.log(`🟢 [DisciplinesController] ${campi.length} campi encontrados`);
            res.json(campi);
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao buscar campi:", error.message);
            res.status(500).json({ error: 'Erro ao buscar campi' });
        }
    }

    /**
     * Lista todas as unidades disponíveis
     * GET /api/disciplines/unidades
     */
    async getUnidades(req, res) {
        try {
            const { campus } = req.query;
            console.log(`🔵 [DisciplinesController] Buscando unidades: campus=${campus}`);
            
            const unidades = await disciplinesService.getUnidades(campus);
            console.log(`🟢 [DisciplinesController] ${unidades.length} unidades encontradas`);
            res.json(unidades);
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao buscar unidades:", error.message);
            res.status(500).json({ error: 'Erro ao buscar unidades' });
        }
    }

    /**
     * Busca por termo (autocomplete)
     * GET /api/disciplines/search
     */
    async searchDisciplines(req, res) {
        try {
            const { q, limit } = req.query;
            console.log(`🔵 [DisciplinesController] Buscando por termo: ${q}`);
            
            if (!q || q.length < 2) {
                return res.json([]);
            }
            
            const results = await disciplinesService.searchDisciplines(q, limit ? parseInt(limit) : 10);
            console.log(`🟢 [DisciplinesController] ${results.length} resultados encontrados`);
            res.json(results);
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao buscar:", error.message);
            res.status(500).json({ error: 'Erro ao buscar disciplinas' });
        }
    }

    /**
     * Estatísticas das disciplinas
     * GET /api/disciplines/stats
     */
    async getStats(req, res) {
        try {
            console.log(`🔵 [DisciplinesController] Obtendo estatísticas`);
            const stats = await disciplinesService.getStats();
            console.log(`🟢 [DisciplinesController] Estatísticas obtidas`);
            res.json(stats);
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao obter estatísticas:", error.message);
            res.status(500).json({ error: 'Erro ao obter estatísticas' });
        }
    }

    /**
     * Conta total de disciplinas
     * GET /api/disciplines/count
     */
    async countDisciplines(req, res) {
        try {
            const { campus, unidade } = req.query;
            console.log(`🔵 [DisciplinesController] Contando disciplinas`);
            
            const filters = {
                campus: campus || null,
                unidade: unidade || null
            };
            
            const total = await disciplinesService.countDisciplines(filters);
            console.log(`🟢 [DisciplinesController] Total: ${total}`);
            res.json({ total });
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao contar disciplinas:", error.message);
            res.status(500).json({ error: 'Erro ao contar disciplinas' });
        }
    }
}

module.exports = new DisciplinesController();
