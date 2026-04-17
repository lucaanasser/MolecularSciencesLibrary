/**
 * Responsabilidade: compatibilidade de import para rota legado de users.
 * Camada: routes.
 * Entradas/Saidas: preserva endpoint legado e delega para roteador unificado.
 * Dependencias criticas: routes/library/users/UsersRoutes e logger compartilhado.
 */

const express = require('express');
const { getLogger } = require('../../shared/logging/logger');
const unifiedUsersRouter = require('./users/UsersRoutes');

const router = express.Router();
const log = getLogger(__filename);
const deprecation = {
    scope: 'legacy-route-wrapper',
    replacement: 'routes/library/users/UsersRoutes',
    sunsetDate: '2026-06-30'
};

router.use((req, _res, next) => {
    log.warn('Router legado de users em uso; migrar para o roteador unificado', {
        route: `${req.method} ${req.originalUrl}`,
        ...deprecation
    });
    next();
});

router.use('/', unifiedUsersRouter);

module.exports = router;
