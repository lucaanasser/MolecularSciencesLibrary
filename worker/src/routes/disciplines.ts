/**
 * Porte de /api/disciplines (rotas legadas de disciplinas).
 * Contrato espelhado de backend/src/routes/academic/DisciplinesRoutes.js →
 * registerAcademicDisciplinesLegacyRoutes.registerLegacyDisciplinesRoutes.
 * No Express essas rotas delegam ao mesmo controller unificado da família v2;
 * aqui os handlers vivem em ./academicDisciplinesShared.
 */
import { Hono } from 'hono';
import type { JwtUser } from '../auth';
import type { Env } from '../index';
import {
  checkExactMatch,
  countDisciplines,
  createDiscipline,
  getCampi,
  getDisciplineByCodigo,
  getDisciplines,
  getFullDiscipline,
  getStats,
  getUnidades,
  searchDisciplines
} from './academicDisciplinesShared';

const disciplines = new Hono<{ Bindings: Env; Variables: { user: JwtUser } }>();

disciplines.post('/', createDiscipline);
disciplines.get('/search', searchDisciplines);
disciplines.get('/stats', getStats);
disciplines.get('/count', countDisciplines);
disciplines.get('/campi', getCampi);
disciplines.get('/unidades', getUnidades);
disciplines.get('/check-exact/:codigo', checkExactMatch);
disciplines.get('/', getDisciplines);
disciplines.get('/:codigo/full', getFullDiscipline);
disciplines.get('/:codigo', getDisciplineByCodigo);

export default disciplines;
