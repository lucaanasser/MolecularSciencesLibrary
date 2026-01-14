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
     * Cria uma disciplina manualmente
     * POST /api/disciplines
     */
    async createDiscipline(req, res) {
        try {
            const { codigo, nome, unidade, campus, creditos_aula, creditos_trabalho, is_postgrad, ementa, objetivos, conteudo_programatico } = req.body;
            
            console.log(`🔵 [DisciplinesController] Criando disciplina: ${codigo}`);
            console.log(`🔵 [DisciplinesController] is_postgrad recebido:`, is_postgrad, typeof is_postgrad);
            
            // Validação de campos obrigatórios
            if (!codigo || !codigo.trim()) {
                console.warn(`🟡 [DisciplinesController] Código não informado`);
                return res.status(400).json({ error: 'O código da disciplina é obrigatório' });
            }
            
            if (!nome || !nome.trim()) {
                console.warn(`🟡 [DisciplinesController] Nome não informado`);
                return res.status(400).json({ error: 'O nome da disciplina é obrigatório' });
            }
            
            // Verifica se já existe
            const existing = await disciplinesService.getDisciplineByCodigo(codigo.trim());
            if (existing) {
                console.warn(`🟡 [DisciplinesController] Disciplina já existe: ${codigo}`);
                return res.status(409).json({ 
                    error: 'Disciplina já existe',
                    codigo: codigo.trim(),
                    nome: existing.nome
                });
            }
            
            // Cria a disciplina
            const disciplineData = {
                codigo: codigo.trim().toUpperCase(),
                nome: nome.trim(),
                unidade: unidade?.trim() || null,
                campus: campus?.trim() || null,
                creditos_aula: parseInt(creditos_aula) || 0,
                creditos_trabalho: parseInt(creditos_trabalho) || 0,
                is_postgrad: Boolean(is_postgrad),
                ementa: ementa?.trim() || null,
                objetivos: objetivos?.trim() || null,
                conteudo_programatico: conteudo_programatico?.trim() || null,
                has_valid_classes: false // Disciplina criada manualmente não tem turmas válidas
            };
            
            console.log(`🔵 [DisciplinesController] disciplineData.is_postgrad:`, disciplineData.is_postgrad);
            
            const result = await disciplinesService.createManualDiscipline(disciplineData);
            console.log(`🟢 [DisciplinesController] Disciplina criada: ${codigo}`);
            res.status(201).json(result);
        } catch (error) {
            console.error("🔴 [DisciplinesController] Erro ao criar disciplina:", error.message);
            res.status(500).json({ error: 'Erro ao criar disciplina' });
        }
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
