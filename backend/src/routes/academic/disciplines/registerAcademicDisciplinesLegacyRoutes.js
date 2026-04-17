/**
 * Responsabilidade: registrar endpoints legados de disciplines e evaluations delegando para controller unificado.
 * Camada: routes.
 * Entradas/Saidas: recebe express.Router e adiciona rotas legadas compatveis.
 * Dependencias criticas: AcademicDisciplinesController, authenticateToken, jsonwebtoken e logger padronizado.
 */

const jwt = require('jsonwebtoken');
const authenticateToken = require('../../../middlewares/authenticateToken');
const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: tenta resolver usuario do authorization sem obrigar autenticacao.
 * Onde e usada: endpoints publicos legados de avaliacoes.
 * Dependencias chamadas: jwt.verify.
 * Efeitos colaterais: injeta req.user quando token valido.
 */
function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET || 'sua_chave_secreta';
        req.user = jwt.verify(token, secret);
    } catch (_error) {
        // Sem hard-fail para compatibilidade com rota publica.
    }

    return next();
}

/**
 * O que faz: escreve aviso padronizado de endpoint legado/deprecated.
 * Onde e usada: todas as rotas legadas deste registrador.
 * Dependencias chamadas: logger.
 * Efeitos colaterais: logging.
 */
function logDeprecated(legacyPath, replacementPath) {
    log.warn('Endpoint legacy/deprecated em uso; migrar para rota v2', {
        legacy_path: legacyPath,
        replacement_path: replacementPath
    });
}

/**
 * O que faz: registra endpoints legados de /api/disciplines.
 * Onde e usada: DisciplinesRoutes.js.
 * Dependencias chamadas: controller unificado.
 * Efeitos colaterais: declaracao de rotas no express.
 */
function registerLegacyDisciplinesRoutes(router, controller) {
    router.post('/', (req, res) => {
        logDeprecated('POST /api/disciplines', 'POST /api/academic/disciplines');
        controller.createDiscipline(req, res);
    });

    router.get('/search', (req, res) => {
        logDeprecated('GET /api/disciplines/search', 'GET /api/academic/disciplines/search');
        controller.searchDisciplines(req, res);
    });

    router.get('/stats', (req, res) => {
        logDeprecated('GET /api/disciplines/stats', 'GET /api/academic/disciplines/stats');
        controller.getStats(req, res);
    });

    router.get('/count', (req, res) => {
        logDeprecated('GET /api/disciplines/count', 'GET /api/academic/disciplines/count');
        controller.countDisciplines(req, res);
    });

    router.get('/campi', (req, res) => {
        logDeprecated('GET /api/disciplines/campi', 'GET /api/academic/disciplines/campi');
        controller.getCampi(req, res);
    });

    router.get('/unidades', (req, res) => {
        logDeprecated('GET /api/disciplines/unidades', 'GET /api/academic/disciplines/unidades');
        controller.getUnidades(req, res);
    });

    router.get('/check-exact/:codigo', (req, res) => {
        logDeprecated('GET /api/disciplines/check-exact/:codigo', 'GET /api/academic/disciplines/check-exact/:codigo');
        controller.checkExactMatch(req, res);
    });

    router.get('/', (req, res) => {
        logDeprecated('GET /api/disciplines', 'GET /api/academic/disciplines');
        controller.getDisciplines(req, res);
    });

    router.get('/:codigo/full', (req, res) => {
        logDeprecated('GET /api/disciplines/:codigo/full', 'GET /api/academic/disciplines/:codigo/full');
        controller.getFullDiscipline(req, res);
    });

    router.get('/:codigo', (req, res) => {
        logDeprecated('GET /api/disciplines/:codigo', 'GET /api/academic/disciplines/:codigo');
        controller.getDisciplineByCodigo(req, res);
    });
}

/**
 * O que faz: registra endpoints legados de /api/evaluations.
 * Onde e usada: DisciplineEvaluationsRoutes.js.
 * Dependencias chamadas: controller unificado e authenticateToken.
 * Efeitos colaterais: declaracao de rotas no express.
 */
function registerLegacyEvaluationsRoutes(router, controller) {
    router.get('/discipline/:codigo', optionalAuth, (req, res) => {
        logDeprecated('GET /api/evaluations/discipline/:codigo', 'GET /api/academic/disciplines/:codigo/evaluations');
        controller.getEvaluationsByDiscipline(req, res);
    });

    router.get('/discipline/:codigo/stats', (req, res) => {
        logDeprecated('GET /api/evaluations/discipline/:codigo/stats', 'GET /api/academic/disciplines/:codigo/evaluations/stats');
        controller.getAggregatedRatings(req, res);
    });

    router.get('/discipline/:codigo/mine', authenticateToken, (req, res) => {
        logDeprecated('GET /api/evaluations/discipline/:codigo/mine', 'GET /api/academic/disciplines/:codigo/evaluations/mine');
        controller.getUserEvaluationForDiscipline(req, res);
    });

    router.get('/mine', authenticateToken, (req, res) => {
        logDeprecated('GET /api/evaluations/mine', 'GET /api/academic/disciplines/evaluations/mine');
        controller.getUserEvaluations(req, res);
    });

    router.post('/', authenticateToken, (req, res) => {
        logDeprecated('POST /api/evaluations', 'POST /api/academic/disciplines/:codigo/evaluations');
        controller.createEvaluation(req, res);
    });

    router.put('/:id', authenticateToken, (req, res) => {
        logDeprecated('PUT /api/evaluations/:id', 'PUT /api/academic/disciplines/evaluations/:id');
        controller.updateEvaluation(req, res);
    });

    router.delete('/:id', authenticateToken, (req, res) => {
        logDeprecated('DELETE /api/evaluations/:id', 'DELETE /api/academic/disciplines/evaluations/:id');
        controller.deleteEvaluation(req, res);
    });

    router.post('/:id/like', authenticateToken, (req, res) => {
        logDeprecated('POST /api/evaluations/:id/like', 'POST /api/academic/disciplines/evaluations/:id/like');
        controller.toggleLike(req, res);
    });
}

module.exports = {
    registerLegacyDisciplinesRoutes,
    registerLegacyEvaluationsRoutes,
    optionalAuth
};
