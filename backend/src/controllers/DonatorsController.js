const DonatorsService = require('../services/DonatorsService');

const DonatorsController = {
    async addDonator(req, res) {
        try {
            const id = await DonatorsService.addDonator(req.body);
            res.status(201).json({ id });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async removeDonator(req, res) {
        try {
            await DonatorsService.removeDonator(req.params.id);
            res.status(204).end();
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async getAllDonators(req, res) {
        try {
            const donators = await DonatorsService.getAllDonators();
            res.json(donators);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async getDonatorById(req, res) {
        try {
            const donator = await DonatorsService.getDonatorById(req.params.id);
            if (!donator) return res.status(404).json({ error: 'Donator not found' });
            res.json(donator);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async getFilteredDonators(req, res) {
        try {
            const { isUser, donationType, name } = req.query;
            const filters = {
                isUser: isUser !== undefined ? isUser === 'true' : undefined,
                donationType,
                name
            };
            const donators = await DonatorsService.getFilteredDonators(filters);
            res.json(donators);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    
    async exportDonatorsToCSV(req, res) {
        try {
            console.log('🔵 [DonatorsController] Exportando doadores em CSV');
            const donators = await DonatorsService.getAllDonators();
            
            // Cabeçalhos do CSV
            const headers = [
                'ID',
                'Nome',
                'NUSP (user_id)',
                'ID do Livro',
                'Tipo de Doação',
                'Valor (R$)',
                'Contato',
                'Observações',
                'Data da Doação'
            ];
            
            // Converter doadores para linhas CSV
            const csvRows = [headers.join(',')];
            
            for (const donator of donators) {
                const row = [
                    donator.id || '',
                    escapeCSV(donator.name || ''),
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
            
            const csvContent = csvRows.join('\n');
            
            // Configurar headers da resposta
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="doadores_${new Date().toISOString().split('T')[0]}.csv"`);
            
            console.log(`🟢 [DonatorsController] CSV exportado com sucesso: ${donators.length} doadores`);
            res.send('\ufeff' + csvContent); // BOM para UTF-8
        } catch (error) {
            console.error('🔴 [DonatorsController] Erro ao exportar CSV:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    
    async importDonatorsFromCSV(req, res) {
        try {
            console.log('🔵 [DonatorsController] Iniciando importação de doadores via CSV');
            
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Nenhum arquivo CSV fornecido' });
            }

            const csvContent = req.file.buffer.toString('utf-8');
            const lines = csvContent.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                return res.status(400).json({ success: false, message: 'Arquivo CSV vazio ou inválido' });
            }

            // Parse do cabeçalho
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            
            const results = {
                success: 0,
                failed: 0,
                errors: []
            };

            // Processar cada linha
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (!line.trim()) continue;

                try {
                    const values = parseCSVLine(line);
                    const donatorData = {};
                    
                    headers.forEach((header, index) => {
                        donatorData[header] = values[index] || '';
                    });

                    // Validação de campos obrigatórios
                    if (!donatorData.name || donatorData.name.trim() === '') {
                        throw new Error('Nome do doador é obrigatório');
                    }
                    
                    if (!donatorData.donation_type || !['book', 'money'].includes(donatorData.donation_type.toLowerCase())) {
                        throw new Error('Tipo de doação deve ser "book" ou "money"');
                    }

                    // Preparar dados para inserção
                    const donatorToAdd = {
                        name: donatorData.name.trim(),
                        user_id: donatorData.user_id ? parseInt(donatorData.user_id) : null,
                        book_id: donatorData.book_id ? parseInt(donatorData.book_id) : null,
                        donation_type: donatorData.donation_type.toLowerCase(),
                        amount: donatorData.amount ? parseFloat(donatorData.amount) : null,
                        contact: donatorData.contact?.trim() || null,
                        notes: donatorData.notes?.trim() || null
                    };

                    // Adicionar doador usando o serviço existente
                    await DonatorsService.addDonator(donatorToAdd);
                    results.success++;
                    console.log(`🟢 [DonatorsController] Doador importado: ${donatorToAdd.name} (linha ${i + 1})`);
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        row: i + 1,
                        error: error.message,
                        data: line.substring(0, 100)
                    });
                    console.error(`🔴 [DonatorsController] Erro na linha ${i + 1}:`, error.message);
                }
            }

            console.log(`🟢 [DonatorsController] Importação concluída: ${results.success} sucesso, ${results.failed} falhas`);
            res.status(200).json(results);
        } catch (error) {
            console.error('🔴 [DonatorsController] Erro ao importar CSV:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// Funções auxiliares para CSV
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

module.exports = DonatorsController;
