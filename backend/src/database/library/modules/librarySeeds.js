/**
 * Responsabilidade: seeds do dominio library para usuarios especiais.
 * Camada: database/library.
 * Entradas/Saidas: recebe db/helpers e cria admin/proaluno se ausentes.
 * Dependencias criticas: bcrypt, run/get.
 */

const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: garante criacao de usuarios especiais admin e proaluno.
 * Onde e usada: initLibraryDb.
 * Dependencias chamadas: get/run do contexto e bcrypt.hash.
 * Efeitos colaterais: pode inserir usuarios especiais na tabela users.
 */
async function seedSpecialUsers({ run, get, bcrypt, saltRounds, adminPassword, proalunoPassword }) {
    const adminNUSP = 1;
    const proalunoNUSP = 2;

    const admin = await get('SELECT * FROM users WHERE NUSP = ?', [adminNUSP]);
    if (!admin) {
        const adminHash = await bcrypt.hash(adminPassword, saltRounds);
        await run(
            `INSERT INTO users (name, NUSP, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Administrador', adminNUSP, 'admin@biblioteca.com', '', adminHash, 'admin']
        );
        log.success('Usuario admin criado', { user_nusp: adminNUSP });
    } else {
        log.warn('Usuario admin ja existe', { user_nusp: adminNUSP });
    }

    const proaluno = await get('SELECT * FROM users WHERE NUSP = ?', [proalunoNUSP]);
    if (!proaluno) {
        const proalunoHash = await bcrypt.hash(proalunoPassword, saltRounds);
        await run(
            `INSERT INTO users (name, NUSP, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Pro Aluno', proalunoNUSP, 'proaluno@biblioteca.com', '', proalunoHash, 'proaluno']
        );
        log.success('Usuario proaluno criado', { user_nusp: proalunoNUSP });
    } else {
        log.warn('Usuario proaluno ja existe', { user_nusp: proalunoNUSP });
    }
}

module.exports = {
    seedSpecialUsers
};
