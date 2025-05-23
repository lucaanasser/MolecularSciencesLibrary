// Importa módulos necessários para manipulação de arquivos, caminhos e leitura de CSV
const fs = require('fs');
const csv = require('csv-parser');
const booksModel = require('../models/BooksModel');

// Função para calcular o dígito verificador EAN-13
function ean13Checksum(number12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(number12[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check;
}

// Gera um EAN-13 único
async function generateUniqueEAN13() {
    let ean;
    let exists = true;
    while (exists) {
        const prefix = 978;
        const middle = Number(Date.now().toString().slice(-8));
        const random = Math.floor(Math.random() * 10);
        const base12 = Number(`${prefix}${middle.toString().padStart(8, '0')}${random}`);
        const check = ean13Checksum(base12.toString().padStart(12, '0'));
        ean = Number(`${base12}${check}`);
        exists = await booksModel.getBookById(ean);
    }
    return ean;
}

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
        // Gera um novo EAN-13 único para o livro
        const id = await generateUniqueEAN13();
        // Monta o objeto do livro a ser inserido no banco de dados
        const bookToInsert = {
            id,
            area: row.area,
            subarea: parseInt(row.subarea, 10),
            authors: row.authors,
            edition: parseInt(row.edition, 10),
            language: parseInt(row.language, 10),
            code: row.code,
            title: row.title,
            subtitle: row.subtitle,
            volume: row.volume ? parseInt(row.volume, 10) : null
        };
        // Insere o livro no banco de dados
        await booksModel.insertBook(bookToInsert);
        console.log(`Livro importado: ${bookToInsert.code} (EAN: ${id})`);
    } catch (err) {
        // Exibe erro caso a importação falhe
        console.error('Erro ao importar livro:', err.message);
    }
}

// Função principal auto-invocada para ler o arquivo CSV e processar suas linhas
(async () => {
    const rows = [];
    // Cria um stream de leitura do arquivo CSV e armazena cada linha em um array
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', async () => {
            // Para cada linha lida, chama a função processRow
            for (const row of rows) {
                await processRow(row);
            }
            console.log('Importação concluída.');
            process.exit(0);
        });
})();