/**
 * Responsabilidade: operacoes de escrita de usuarios no banco.
 * Camada: model.
 * Entradas/Saidas: cria, atualiza e remove usuarios.
 * Dependencias criticas: database/db e logger compartilhado.
 */

const { executeQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria usuario ativo sem senha inicial.
     * Onde e usada: UsersService.createUser.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere registro na tabela users.
     */
    async createUser({ name, email, NUSP, phone, class: userClass }) {
        try {
            const result = await executeQuery(
                'INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image, class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, NUSP, email, phone, null, 'aluno', null, userClass, 'active']
            );
            return result.lastID;
        } catch (error) {
            log.error('Falha ao criar usuario ativo', { email, NUSP, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: cria usuario ativo recebendo hash preexistente (migracao/import).
     * Onde e usada: UsersService.importUsersFromCSV.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere registro na tabela users.
     */
    async createUserWithHash({ name, email, NUSP, phone, role = 'aluno', profile_image = null, class: userClass = null, password_hash = null, status = 'active' }) {
        try {
            const result = await executeQuery(
                'INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image, class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, NUSP, email, phone, password_hash, role, profile_image, userClass, status]
            );
            return result.lastID;
        } catch (error) {
            log.error('Falha ao criar usuario com hash', { email, NUSP, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: cria usuario pendente para fluxo de auto-cadastro.
     * Onde e usada: UsersService.registerUser.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere registro pending na tabela users.
     */
    async createPendingUser({ name, email, NUSP, phone, class: userClass }) {
        try {
            const result = await executeQuery(
                'INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image, class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, NUSP, email, phone, null, 'aluno', null, userClass, 'pending']
            );
            return result.lastID;
        } catch (error) {
            log.error('Falha ao criar usuario pendente', { email, NUSP, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza hash de senha do usuario.
     * Onde e usada: UsersService.resetPassword.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: altera coluna password_hash.
     */
    async updateUserPassword(id, passwordHash) {
        try {
            return await executeQuery('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
        } catch (error) {
            log.error('Falha ao atualizar senha de usuario', { user_id: id, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza caminho de imagem de perfil.
     * Onde e usada: UsersService.updateUserProfileImage.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: altera coluna profile_image.
     */
    async updateUserProfileImage(id, profileImage) {
        const imagePath = profileImage && !profileImage.startsWith('/images/')
            ? `/images/${profileImage.split('/').pop()}`
            : profileImage;

        try {
            return await executeQuery('UPDATE users SET profile_image = ? WHERE id = ?', [imagePath, id]);
        } catch (error) {
            log.error('Falha ao atualizar imagem de perfil', { user_id: id, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove usuario por id.
     * Onde e usada: UsersService.deleteUserById e rejectUser.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: deleta registro da tabela users.
     */
    async deleteUserById(id) {
        try {
            return await executeQuery('DELETE FROM users WHERE id = ?', [id]);
        } catch (error) {
            log.error('Falha ao remover usuario', { user_id: id, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: aprova usuario pendente para ativo.
     * Onde e usada: UsersService.approveUser.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: altera status na tabela users.
     */
    async approveUser(id) {
        try {
            return await executeQuery("UPDATE users SET status = 'active' WHERE id = ?", [id]);
        } catch (error) {
            log.error('Falha ao aprovar usuario pendente', { user_id: id, err: error.message });
            throw error;
        }
    }
};
