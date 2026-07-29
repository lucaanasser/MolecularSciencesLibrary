/**
 * Porte de /api/academic/disciplines (família v2 unificada de disciplinas + avaliações).
 * Contrato espelhado de backend/src/routes/academic/disciplines/AcademicDisciplinesRoutes.js.
 * As rotas legadas (/api/disciplines e /api/evaluations) são montadas por arquivos próprios
 * (disciplines.ts e disciplineEvaluations.ts) sobre os mesmos handlers compartilhados.
 * Rotas estáticas (/evaluations/*) registradas antes das dinâmicas (/:codigo/*).
 */
import { Hono } from 'hono';
import { authenticateToken, type JwtUser } from '../auth';
import type { Env } from '../index';
import {
  checkExactMatch,
  countDisciplines,
  createDiscipline,
  createEvaluation,
  deleteEvaluation,
  getAggregatedRatings,
  getCampi,
  getDisciplineByCodigo,
  getDisciplines,
  getEvaluationsByDiscipline,
  getFullDiscipline,
  getStats,
  getUnidades,
  getUserEvaluationForDiscipline,
  getUserEvaluations,
  searchDisciplines,
  toggleLike,
  updateEvaluation
} from './academicDisciplinesShared';

const academicDisciplines = new Hono<{ Bindings: Env; Variables: { user: JwtUser } }>();

academicDisciplines.post('/', createDiscipline);
academicDisciplines.get('/search', searchDisciplines);
academicDisciplines.get('/stats', getStats);
academicDisciplines.get('/count', countDisciplines);
academicDisciplines.get('/campi', getCampi);
academicDisciplines.get('/unidades', getUnidades);
academicDisciplines.get('/check-exact/:codigo', checkExactMatch);
academicDisciplines.get('/', getDisciplines);

academicDisciplines.get('/evaluations/mine', authenticateToken(), getUserEvaluations);
academicDisciplines.put('/evaluations/:id', authenticateToken(), updateEvaluation);
academicDisciplines.delete('/evaluations/:id', authenticateToken(), deleteEvaluation);
academicDisciplines.post('/evaluations/:id/like', authenticateToken(), toggleLike);

academicDisciplines.get('/:codigo/full', getFullDiscipline);
academicDisciplines.get('/:codigo/evaluations/stats', getAggregatedRatings);
academicDisciplines.get('/:codigo/evaluations/mine', authenticateToken(), getUserEvaluationForDiscipline);
academicDisciplines.get('/:codigo/evaluations', getEvaluationsByDiscipline);
// v2 injeta o :codigo do path no body, igual ao Express.
academicDisciplines.post('/:codigo/evaluations', authenticateToken(), (c) => createEvaluation(c, true));
academicDisciplines.get('/:codigo', getDisciplineByCodigo);

export default academicDisciplines;
