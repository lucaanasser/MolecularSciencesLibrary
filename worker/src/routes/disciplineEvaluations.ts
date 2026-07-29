/**
 * Porte de /api/evaluations (rotas legadas de avaliações de disciplinas).
 * Contrato espelhado de backend/src/routes/academic/DisciplineEvaluationsRoutes.js →
 * registerAcademicDisciplinesLegacyRoutes.registerLegacyEvaluationsRoutes.
 * GET /discipline/:codigo usa auth opcional (token inválido não bloqueia),
 * demais rotas de escrita/leitura pessoal exigem authenticateToken.
 */
import { Hono } from 'hono';
import { authenticateToken, type JwtUser } from '../auth';
import type { Env } from '../index';
import {
  createEvaluation,
  deleteEvaluation,
  getAggregatedRatings,
  getEvaluationsByDiscipline,
  getUserEvaluationForDiscipline,
  getUserEvaluations,
  toggleLike,
  updateEvaluation
} from './academicDisciplinesShared';

const evaluations = new Hono<{ Bindings: Env; Variables: { user: JwtUser } }>();

evaluations.get('/discipline/:codigo', getEvaluationsByDiscipline);
evaluations.get('/discipline/:codigo/stats', getAggregatedRatings);
evaluations.get('/discipline/:codigo/mine', authenticateToken(), getUserEvaluationForDiscipline);
evaluations.get('/mine', authenticateToken(), getUserEvaluations);
evaluations.post('/', authenticateToken(), (c) => createEvaluation(c));
evaluations.put('/:id', authenticateToken(), updateEvaluation);
evaluations.delete('/:id', authenticateToken(), deleteEvaluation);
evaluations.post('/:id/like', authenticateToken(), toggleLike);

export default evaluations;
