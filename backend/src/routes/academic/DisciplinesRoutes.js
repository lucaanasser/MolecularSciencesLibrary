/**
 * Responsabilidade: wrapper de compatibilidade para rotas legadas de disciplinas.
 * Camada: routes.
 * Entradas/Saidas: preserva /api/disciplines com delegacao para registrador legado unificado.
 * Dependencias criticas: AcademicDisciplinesController e registerAcademicDisciplinesLegacyRoutes.
 */

const express = require('express');
const academicDisciplinesController = require('../../controllers/academic/disciplines/AcademicDisciplinesController');
const { registerLegacyDisciplinesRoutes } = require('./disciplines/registerAcademicDisciplinesLegacyRoutes');

const router = express.Router();
registerLegacyDisciplinesRoutes(router, academicDisciplinesController);

module.exports = router;
