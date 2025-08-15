// Importa módulos necessários para manipulação de arquivos, caminhos e leitura de CSV
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Configura o caminho correto do banco (pasta raiz /database/library.db)
const dbAbsolutePath = path.resolve(__dirname, '../../database/library.db');
process.env.DATABASE_URL = `sqlite://${dbAbsolutePath}`;
console.log(`[importCsv] DATABASE_URL definido para: ${process.env.DATABASE_URL}`);

// Agora que o env foi definido, carregue o model (que usa db.js)
const booksModel = require('../src/models/BooksModel');

// Recebe o caminho do arquivo CSV via argumento de linha de comando
const csvFilePath = process.argv[2]; 

// Verifica se o caminho do arquivo foi fornecido
if (!csvFilePath) {
    console.error('Por favor, forneça o caminho do arquivo CSV.');
    process.exit(1);
}

// Função assíncrona para processar cada linha do CSV

async function processRow(row) {
    try {
        // Usa o campo 'id' do CSV como identificador do livro
        const bookToInsert = {
            id: parseInt(row.id, 10),
            area: row.area,
            subarea: parseInt(row.subarea, 10),
            authors: row.authors,
            edition: parseInt(row.edition, 10),
            language: parseInt(row.language, 10),
            code: row.code,
            title: row.title,
            subtitle: row.subtitle && row.subtitle.length > 0 ? row.subtitle : null,
            volume: row.volume && row.volume.length > 0 ? parseInt(row.volume, 10) : null,
            is_reserved: row.is_reserved ? parseInt(row.is_reserved, 10) : 0
        };
        await booksModel.insertBook(bookToInsert);
        console.log(`Livro importado: ${bookToInsert.code} (ID: ${bookToInsert.id})`);
    } catch (err) {
        console.error('Erro ao importar livro:', err.message);
    }
}


// Função principal auto-invocada para ler o arquivo CSV e processar suas linhas
(async () => {
    const rows = [];
    let rowCount = 0;
    console.log(`[importCsv] Iniciando leitura do arquivo: ${csvFilePath}`);
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            rows.push(row);
            rowCount++;
        })
        .on('end', async () => {
            console.log(`[importCsv] Total de linhas lidas do CSV: ${rowCount}`);
            if (rowCount === 0) {
                console.log('[importCsv] Nenhuma linha encontrada no CSV. Verifique o arquivo e o caminho.');
            }
            for (const [i, row] of rows.entries()) {
                console.log(`[importCsv] Processando linha ${i + 1}:`, row);
                await processRow(row);
            }
            console.log('Importação concluída.');
            process.exit(0);
        })
        .on('error', (err) => {
            console.error(`[importCsv] Erro ao ler o arquivo CSV: ${err.message}`);
            process.exit(1);
        });
})();