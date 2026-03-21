/**
 * Responsabilidade: compatibilidade de import para rota legado de donators.
 * Camada: routes.
 * Entradas/Saidas: preserva endpoint legado e delega para roteador unificado.
 * Dependencias criticas: routes/library/donators/DonatorsRoutes e logger compartilhado.
 */

const express = require('express');
const { getLogger } = require('../../shared/logging/logger');
const unifiedDonatorsRouter = require('./donators/DonatorsRoutes');

const router = express.Router();
const log = getLogger(__filename);
const deprecation = {
    scope: 'legacy-route-wrapper',
    replacement: 'routes/library/donators/DonatorsRoutes',
    sunsetDate: '2026-06-30'
};

router.use((req, _res, next) => {
    log.warn('Router legado de donators em uso; migrar para o roteador unificado', {
        route: `${req.method} ${req.originalUrl}`,
        ...deprecation
    });
    next();
});

router.use('/', unifiedDonatorsRouter);

module.exports = router;
