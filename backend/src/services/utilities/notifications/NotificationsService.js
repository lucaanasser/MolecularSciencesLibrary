const coreNotification = require('./modules/coreNotification');
const overdueNotification = require('./modules/overdueNotification');
const nudgeNotification = require('./modules/nudgeNotification');

/**
 * Orquestrador de notificacoes internas.
 * Mantem a mesma interface publica usada por controllers e scripts,
 * delegando implementacoes para modulos de dominio.
 */
class NotificationsService {}

Object.assign(
    NotificationsService.prototype,
    coreNotification,
    overdueNotification,
    nudgeNotification
);

module.exports = new NotificationsService();
