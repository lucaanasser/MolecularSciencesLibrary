/**
 * Responsabilidade: helpers de inicializacao do SQLite para scripts de bootstrap.
 * Camada: database/shared.
 * Entradas/Saidas: encapsula db.run/db.get em Promises para fluxo async/await.
 * Dependencias criticas: sqlite3.Database.
 */

/**
 * O que faz: executa SQL de escrita e retorna metadata da operacao.
 * Onde e usada: inicializadores de schema/seeds no bootstrap do banco.
 * Dependencias chamadas: sqlite3.Database.run.
 * Efeitos colaterais: altera dados/schema no banco.
 */
function run(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function onRun(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this);
        });
    });
}

/**
 * O que faz: executa SQL de leitura unitária e retorna uma linha.
 * Onde e usada: validacoes e seeds no bootstrap do banco.
 * Dependencias chamadas: sqlite3.Database.get.
 * Efeitos colaterais: nenhum; apenas leitura.
 */
function get(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

/**
 * O que faz: encerra conexao sqlite de forma assíncrona.
 * Onde e usada: finalize do initDb.
 * Dependencias chamadas: sqlite3.Database.close.
 * Efeitos colaterais: fecha conexao ativa com banco.
 */
function close(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

module.exports = {
    run,
    get,
    close
};
