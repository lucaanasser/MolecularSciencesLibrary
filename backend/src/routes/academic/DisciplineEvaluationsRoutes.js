/**
 * Responsabilidade: wrapper de compatibilidade para rotas legadas de avaliacoes.
 * Camada: routes.
 * Entradas/Saidas: preserva /api/evaluations com delegacao para registrador legado unificado.
 * Dependencias criticas: AcademicDisciplinesController e registerAcademicDisciplinesLegacyRoutes.
 */

const express = require('express');
const academicDisciplinesController = require('../../controllers/academic/disciplines/AcademicDisciplinesController');
const { registerLegacyEvaluationsRoutes } = require('./disciplines/registerAcademicDisciplinesLegacyRoutes');

const router = express.Router();
registerLegacyEvaluationsRoutes(router, academicDisciplinesController);

module.exports = router;
