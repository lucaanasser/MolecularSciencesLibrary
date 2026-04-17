const coreNotification = require('./modules/coreNotification');
const overdueNotification = require('./modules/overdueNotification');
const nudgeNotification = require('./modules/nudgeNotification');
const deliveryNotification = require('./modules/deliveryNotification');

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
    nudgeNotification,
    deliveryNotification
);

module.exports = new NotificationsService();
