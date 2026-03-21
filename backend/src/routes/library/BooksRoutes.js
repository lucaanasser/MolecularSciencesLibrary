/**
 * Responsabilidade: compatibilidade de import para rota legado de books.
 * Camada: routes.
 * Entradas/Saidas: reexporta roteador unificado do dominio books.
 * Dependencias criticas: routes/library/books/BooksRoutes.
 */

const express = require('express');
const unifiedBooksRouter = require('./books/BooksRoutes');
const { getLogger } = require('../../shared/logging/logger');

const router = express.Router();
const log = getLogger(__filename);
const deprecation = {
	scope: 'legacy-route-wrapper',
	replacement: 'routes/library/books/BooksRoutes',
	sunsetDate: '2026-06-30'
};

router.use((req, _res, next) => {
	log.warn('Router legado de books em uso; migrar para o roteador unificado', {
		route: `${req.method} ${req.originalUrl}`,
		...deprecation
	});
	next();
});

router.use('/', unifiedBooksRouter);

module.exports = router;