/**
 * Fachada de compatibilidade: reexporta o controller unificado de userSchedules.
 * Mantido para caminhos de import legados; a implementacao vive em ./userSchedules/.
 */

module.exports = require('./userSchedules/UserSchedulesController');
