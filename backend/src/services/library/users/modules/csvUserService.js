/**
 * Responsabilidade: importacao e exportacao CSV de usuarios.
 * Camada: service.
 * Entradas/Saidas: converte users para CSV e importa arquivo CSV.
 * Dependencias criticas: UsersModel, csvUtils e logger.
 */

const UsersModel = require('../../../../models/library/users/UsersModel');
const { importFromCSV, escapeCSV } = require('../../../../utils/csvUtils');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: gera CSV com todos os campos de usuarios, incluindo hash.
     * Onde e usada: UsersController.exportUsersToCSV.
     * Dependencias chamadas: UsersModel.getAllUsersForExport e escapeCSV.
     * Efeitos colaterais: nenhum.
     */
    async exportUsersToCSV() {
        const users = await UsersModel.getAllUsersForExport();
        const headers = ['id', 'name', 'NUSP', 'email', 'phone', 'password_hash', 'role', 'profile_image', 'class', 'created_at'];
        const rows = [headers.join(',')];

        for (const user of users) {
            rows.push([
                escapeCSV(user.id || ''),
                escapeCSV(user.name || ''),
                escapeCSV(user.NUSP || ''),
                escapeCSV(user.email || ''),
                escapeCSV(user.phone || ''),
                escapeCSV(user.password_hash || ''),
                escapeCSV(user.role || ''),
                escapeCSV(user.profile_image || ''),
                escapeCSV(user.class || ''),
                escapeCSV(user.created_at || '')
            ].join(','));
        }

        return {
            count: users.length,
            filename: `usuarios_${new Date().toISOString().split('T')[0]}.csv`,
            content: `\ufeff${rows.join('\n')}`
        };
    },

    /**
     * O que faz: importa usuarios via CSV com validacoes de campos.
     * Onde e usada: UsersController.importUsersFromCSV.
     * Dependencias chamadas: importFromCSV, UsersModel.createUserWithHash e UsersService.createUser.
     * Efeitos colaterais: cria multiplos usuarios no banco e pode enviar email.
     */
    async importUsersFromCSV(file) {
        if (!file) {
            throw new Error('Nenhum arquivo CSV fornecido');
        }

        const requiredFields = ['name', 'NUSP', 'email', 'phone', 'role', 'class'];

        return importFromCSV({
            fileBuffer: file.buffer,
            requiredFields,
            mapRow: (rowData) => {
                const userData = {
                    name: rowData.name?.trim(),
                    NUSP: parseInt(rowData.NUSP, 10),
                    email: rowData.email?.trim(),
                    phone: rowData.phone?.trim(),
                    role: rowData.role?.trim(),
                    class: rowData.class?.trim() || null,
                    profile_image: rowData.profile_image?.trim() || null,
                    password_hash: rowData.password_hash?.trim() || null
                };

                if (!/^\+?\d{10,15}$/.test(userData.phone || '')) {
                    throw new Error(`Telefone inválido: ${userData.phone}`);
                }
                if (!['admin', 'aluno', 'proaluno'].includes(userData.role)) {
                    throw new Error(`Role inválido: ${userData.role}. Use: admin, aluno ou proaluno`);
                }
                if (Number.isNaN(userData.NUSP)) {
                    throw new Error(`NUSP inválido: ${rowData.NUSP}`);
                }

                return userData;
            },
            addFn: async (userData) => {
                if (userData.password_hash) {
                    return UsersModel.createUserWithHash(userData);
                }
                const { password_hash: _ignored, ...withoutHash } = userData;
                const created = await this.createUser(withoutHash);
                return created?.id || created;
            },
            logger: {
                success: (user, row) => log.success('Usuario importado com sucesso', { row, user_ref: user?.email || user?.id || 'n/a' }),
                error: (error, row) => log.error('Falha ao importar usuario via CSV', { row, err: error.message }),
                finish: (results) => log.success('Importacao CSV de usuarios concluida', { success: results.success, failed: results.failed })
            }
        });
    }
};
