/**
 * Fachada de compatibilidade: reexporta o service modularizado de userSchedules.
 * Mantida para preservar o caminho antigo de require dos controllers.
 */

module.exports = require('./userSchedules/UserSchedulesService');
