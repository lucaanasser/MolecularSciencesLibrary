// backend/src/utils/csvUtils.js
// Utilitário genérico para importação/exportação de CSV

/**
 * Escapa valores para CSV (adiciona aspas se necessário)
 */
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

/**
 * Parse simples de linha CSV (considera aspas)
 */
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

/**
 * Função genérica para importar entidades via CSV
 * @param {Buffer} fileBuffer - Buffer do arquivo CSV
 * @param {Array<string>} requiredFields - Campos obrigatórios
 * @param {Function} mapRow - Função que mapeia linha para objeto
 * @param {Function} addFn - Função que insere no banco
 * @param {Object} logger - Logger para logs customizados
 * @returns {Promise<Object>} Resultado da importação
 */
async function importFromCSV({ fileBuffer, requiredFields, mapRow, addFn, logger }) {
    const csvContent = fileBuffer.toString('utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        return { success: 0, failed: 0, errors: [{ row: 0, error: 'Arquivo CSV vazio ou inválido' }] };
    }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results = { success: 0, failed: 0, errors: [] };
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        try {
            const values = parseCSVLine(line);
            const rowData = {};
            headers.forEach((header, idx) => {
                rowData[header] = values[idx] || '';
            });
            // Validação de campos obrigatórios
            const missingFields = requiredFields.filter(field => !rowData[field] || rowData[field].trim() === '');
            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
            }
            const entity = mapRow(rowData);
            await addFn(entity);
            results.success++;
            if (logger && logger.success) logger.success(entity, i + 1);
        } catch (error) {
            results.failed++;
            results.errors.push({ row: i + 1, error: error.message, data: line.substring(0, 100) });
            if (logger && logger.error) logger.error(error, i + 1, line);
        }
    }
    if (logger && logger.finish) logger.finish(results);
    return results;
}

module.exports = { escapeCSV, parseCSVLine, importFromCSV };