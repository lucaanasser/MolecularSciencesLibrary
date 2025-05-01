// Importa módulos necessários para manipulação de arquivos, caminhos e leitura de CSV
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { db } = require('./db'); // Importa a instância do banco de dados

// Recebe o caminho do arquivo CSV via argumento de linha de comando
const csvFilePath = process.argv[2]; 

// Verifica se o caminho do arquivo foi fornecido
if (!csvFilePath) {
    console.error('Por favor, forneça o caminho do arquivo CSV.');
    process.exit(1);
}

// Cria um stream de leitura do arquivo CSV e processa cada linha
fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
        // Para cada linha do CSV, insere os dados na tabela 'books'
        db.run(`
            INSERT INTO books (area, subarea, authors, edition, language, volume, exemplar, code, title, subtitle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            row.area,
            row.subarea,
            row.authors,
            row.edition,
            row.language,
            row.volume,
            row.exemplar,
            row.code,
            row.title,
            row.subtitle
        ], (err) => {
            if (err) {
                // Exibe erro caso a inserção falhe
                console.error('Erro ao inserir linha:', err.message);
            }
        });
    })
    .on('end', () => {
        // Ao final da leitura, exibe mensagem e fecha o banco
        console.log('Importação concluída.');
        db.close();
    });