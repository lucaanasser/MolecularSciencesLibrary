/**
 * Responsabilidade: orquestrar persistencia unificada de doadores.
 * Camada: model.
 * Entradas/Saidas: expoe API de leitura/escrita para donators.
 * Dependencias criticas: coreDonatorModel e queryDonatorModel.
 */

const coreDonatorModel = require('./modules/coreDonatorModel');
const queryDonatorModel = require('./modules/queryDonatorModel');

class DonatorsModel {}

Object.assign(
    DonatorsModel.prototype,
    coreDonatorModel,
    queryDonatorModel
);

module.exports = new DonatorsModel();
