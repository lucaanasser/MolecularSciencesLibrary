/**
 * Responsabilidade: operacoes de leitura e busca de usuarios.
 * Camada: model.
 * Entradas/Saidas: consulta usuarios por filtros, ids e credenciais.
 * Dependencias criticas: database/db e logger compartilhado.
 */

const { getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

const userSelectWithPassword = 'id, name, NUSP, email, phone, role, profile_image, class, created_at, password_hash, status';

module.exports = {
    /**
     * O que faz: busca usuario por email.
     * Onde e usada: fluxos de login, reset e cadastro.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum.
     */
    async getUserByEmail(email) {
        try {
            return await getQuery(`SELECT ${userSelectWithPassword} FROM users WHERE email = ?`, [email]);
        } catch (error) {
            log.error('Falha ao buscar usuario por email', { email, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca usuario por id.
     * Onde e usada: profile, aprovacoes e consultas administrativas.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum.
     */
    async getUserById(id) {
        try {
            return await getQuery(`SELECT ${userSelectWithPassword} FROM users WHERE id = ?`, [id]);
        } catch (error) {
            log.error('Falha ao buscar usuario por id', { user_id: id, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca usuario por NUSP.
     * Onde e usada: login e validacoes de cadastro.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum.
     */
    async getUserByNUSP(NUSP) {
        try {
            return await getQuery(`SELECT ${userSelectWithPassword} FROM users WHERE NUSP = ?`, [NUSP]);
        } catch (error) {
            log.error('Falha ao buscar usuario por NUSP', { NUSP, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca usuario por telefone.
     * Onde e usada: validacao de auto-cadastro.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum.
     */
    async getUserByPhone(phone) {
        try {
            return await getQuery('SELECT id, name, NUSP, email, phone, role, status FROM users WHERE phone = ?', [phone]);
        } catch (error) {
            log.error('Falha ao buscar usuario por telefone', { phone, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: lista usuarios ativos para tela administrativa.
     * Onde e usada: UsersService.getAllUsers.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async getAllUsers() {
        return allQuery("SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at FROM users WHERE status != 'pending'");
    },

    /**
     * O que faz: lista usuarios com hash para exportacao.
     * Onde e usada: UsersService.exportUsersToCSV.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async getAllUsersForExport() {
        return allQuery('SELECT id, name, NUSP, email, phone, password_hash, role, profile_image, class, created_at FROM users');
    },

    /**
     * O que faz: lista usuarios pendentes de aprovacao.
     * Onde e usada: UsersService.getPendingUsers.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async getPendingUsers() {
        return allQuery("SELECT id, name, NUSP, email, phone, class, created_at FROM users WHERE status = 'pending' ORDER BY created_at ASC");
    },

    /**
     * O que faz: lista administradores ativos.
     * Onde e usada: workflows de notificacao para admins.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async getAllAdmins() {
        return allQuery("SELECT id, name, email FROM users WHERE role = 'admin' AND status = 'active'");
    },

    /**
     * O que faz: busca usuarios para autocomplete por nome/NUSP/email.
     * Onde e usada: UsersService.searchUsers.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async searchUsers(searchTerm, limit = 100) {
        const whereConditions = ["status != 'pending'"];
        const params = [];

        if (searchTerm && searchTerm.length > 0) {
            whereConditions.unshift('(' +
                'name LIKE ? COLLATE NOCASE OR ' +
                'NUSP LIKE ? COLLATE NOCASE OR ' +
                'email LIKE ? COLLATE NOCASE' +
                ')');
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        return allQuery(
            `SELECT id, name, NUSP, email, phone, class, profile_image, role FROM users WHERE ${whereConditions.join(' AND ')} LIMIT ?`,
            [...params, limit]
        );
    }
};
