const { executeQuery, getQuery, allQuery } = require('./db');

// Mapeamento de códigos de área e subárea
const areaCodes = {
    "Física": "FIS",
    "Química": "QUI",
    "Biologia": "BIO",
    "Matemática": "MAT",
    "Computação": "CMP",
    "Variados": "VAR"
};

const subareaCodes = {
    "Física": { "Física Geral": "01", "Física Moderna": "02", "Astrofísica": "03" },
    "Química": { "Orgânica": "01", "Inorgânica": "02", "Analítica": "03" },
    "Biologia": { "Molecular": "01", "Celular": "02", "Genética": "03" },
    "Matemática": { "Álgebra": "01", "Cálculo": "02", "Geometria": "03" },
    "Computação": { "Algoritmos": "01", "Estruturas de Dados": "02", "Teoria da Computação": "03" },
    "Variados": { "Outros": "01" }
};

/**
 * Gera o código do livro:
 * Formato: AREA-SUBAREA.SEQ.VOL
 * - AREA: código da área (ex: FIS)
 * - SUBAREA: código da subárea (ex: 01)
 * - SEQ: número sequencial dentro da subárea (ex: 01, 02, ...)
 * - VOL: número do volume (ex: 01, 02, ...)
 */
async function generateBookCode({ area, subarea, volume }) {
    const areaCode = areaCodes[area] || "XXX";
    const subareaCode = (subareaCodes[area] && subareaCodes[area][subarea]) || "00";
    const vol = String(volume).padStart(2, "0");

    // Busca o maior sequencial já usado na subárea
    const query = `
        SELECT code FROM books
        WHERE area = ? AND subarea = ?
        ORDER BY code DESC LIMIT 1
    `;
    const lastBook = await getQuery(query, [area, subareaCode]);
    let seq = "01";
    if (lastBook && lastBook.code) {
        // Extrai o sequencial do código: FIS-01.02.01 => 02
        const parts = lastBook.code.split(".");
        if (parts.length >= 2) {
            const lastSeq = parseInt(parts[1], 10);
            seq = (lastSeq + 1).toString().padStart(2, "0");
        }
    }
    return `${areaCode}-${subareaCode}.${seq}.${vol}`;
}

/**
 * Adiciona um livro ao banco de dados.
 * bookData deve conter: area, subarea, authors, edition, language, volume, exemplar, title
 */
async function addBook(bookData) {
    const {
        area,
        subarea,
        authors,
        edition,
        language,
        volume,
        exemplar,
        title
    } = bookData;

    // Gera o código do livro
    const code = await generateBookCode({ area, subarea, volume });

    const query = `
        INSERT INTO books (area, subarea, authors, edition, language, volume, exemplar, code, title)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        area,
        subareaCodes[area][subarea],
        authors,
        edition,
        language,
        volume,
        exemplar,
        code,
        title
    ];

    const result = await executeQuery(query, params);
    return { id: result, code };
}

/**
 * Retorna todos os livros.
 */
async function getBooks() {
    return await allQuery(`SELECT * FROM books`);
}

/**
 * Retorna um livro pelo ID.
 */
async function getBookById(id) {
    return await getQuery(`SELECT * FROM books WHERE id = ?`, [id]);
}

module.exports = {
    addBook,
    getBooks,
    getBookById,
    generateBookCode,
    areaCodes,
    subareaCodes
};