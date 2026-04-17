/**
 * Responsabilidade: importacao e exportacao CSV de doadores.
 * Camada: service.
 * Entradas/Saidas: converte dados de doadores para/de CSV.
 * Dependencias criticas: csvUtils e DonatorsModel.
 */

const { importFromCSV, escapeCSV } = require('../../../../utils/csvUtils');
const DonatorsModel = require('../../../../models/library/donators/DonatorsModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: gera CSV completo de doadores para download.
     * Onde e usada: controller csvHandlers.exportDonatorsToCSV.
     * Dependencias chamadas: DonatorsModel.getAllDonators e escapeCSV.
     * Efeitos colaterais: nenhum.
     */
    async exportDonatorsToCSV() {
        const donators = await DonatorsModel.getAllDonators();
        const headers = [
            'ID',
            'Nome',
            'Tag',
            'NUSP (user_id)',
            'ID do Livro',
            'Tipo de Doação',
            'Valor (R$)',
            'Contato',
            'Observações',
            'Data da Doação'
        ];

        const csvRows = [headers.join(',')];
        for (const donator of donators) {
            const row = [
                donator.id || '',
                escapeCSV(donator.name || ''),
                escapeCSV(donator.tag || ''),
                donator.user_id || '',
                donator.book_id || '',
                donator.donation_type || '',
                donator.amount || '',
                escapeCSV(donator.contact || ''),
                escapeCSV(donator.notes || ''),
                donator.created_at || ''
            ];
            csvRows.push(row.join(','));
        }

        return {
            count: donators.length,
            content: `\ufeff${csvRows.join('\n')}`,
            filename: `doadores_${new Date().toISOString().split('T')[0]}.csv`
        };
    },

    /**
     * O que faz: importa doadores de arquivo CSV com validacoes de campos.
     * Onde e usada: controller csvHandlers.importDonatorsFromCSV.
     * Dependencias chamadas: importFromCSV e coreDonatorService.addDonator.
     * Efeitos colaterais: multiplas insercoes na tabela donators.
     */
    async importDonatorsFromCSV(file) {
        if (!file) {
            throw new Error('Nenhum arquivo CSV fornecido');
        }

        const requiredFields = ['name', 'donation_type'];
        const logger = {
            success: (entity, row) => log.success('Doador importado via CSV', { name: entity.name, row }),
            error: (error, row) => log.error('Falha ao importar linha CSV', { row, err: error.message }),
            finish: (results) => log.success('Importacao CSV concluida', { success: results.success, failed: results.failed })
        };

        return importFromCSV({
            fileBuffer: file.buffer,
            requiredFields,
            mapRow: (donatorData) => {
                const type = String(donatorData.donation_type || '').toLowerCase();
                if (!['book', 'money'].includes(type)) {
                    throw new Error('Tipo de doação deve ser "book" ou "money"');
                }
                return {
                    name: String(donatorData.name || '').trim(),
                    tag: donatorData.tag ? String(donatorData.tag).trim() : null,
                    user_id: donatorData.user_id ? parseInt(donatorData.user_id, 10) : null,
                    book_id: donatorData.book_id ? parseInt(donatorData.book_id, 10) : null,
                    donation_type: type,
                    amount: donatorData.amount ? parseFloat(donatorData.amount) : null,
                    contact: donatorData.contact ? String(donatorData.contact).trim() : null,
                    notes: donatorData.notes ? String(donatorData.notes).trim() : null
                };
            },
            addFn: this.addDonator.bind(this),
            logger
        });
    }
};
