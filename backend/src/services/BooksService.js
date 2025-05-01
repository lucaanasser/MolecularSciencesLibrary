// BooksService contém toda a lógica de negócio relacionada a livros
const booksModel = require('../models/BooksModel');

// Mapeamento de códigos de área (ex: Física -> FIS)
const areaCodes = {
    "Física": "FIS",
    "Química": "QUI",
    "Biologia": "BIO",
    "Matemática": "MAT",
    "Computação": "CMP",
    "Variados": "VAR"
};

// Mapeamento de códigos de subárea para cada área
const subareaCodes = {
    "Física": { 
        "Física Geral": 1, 
        "Física Moderna": 2, 
        "Astrofísica": 3 
    },
    "Química": { 
        "Orgânica": 1, 
        "Inorgânica": 2, 
        "Analítica": 3 
    },
    "Biologia": { 
        "Molecular": 1, 
        "Celular": 2, 
        "Genética": 3 
    },
    "Matemática": { 
        "Álgebra": 1,
        "Cálculo": 2,
        "Geometria": 3 
    },
    "Computação": { 
        "Algoritmos": 1,
        "Estruturas de Dados": 2, 
        "Teoria da Computação": 3 
    },
    "Variados": { 
        "Outros": 1 
    }
};

class BooksService {
    /**
     * Gera o código único do livro baseado na área, subárea e volume.
     * Formato: AREA-<Subarea>.<Sequencial>.<Volume>
     * Exemplo: FIS-01.02.01
     * @param {Object} param0 - Objeto com area, subarea e volume
     * @returns {Promise<string>} Código gerado
     */
    async generateBookCode({ area, subarea, volume }) {
        const areaCode = areaCodes[area] || "XXX";
        // subarea já é inteiro, padronize para string com 2 dígitos
        const subareaCode = String(subarea).padStart(2, "0");
        const vol = String(volume).padStart(2, "0");

        // Busca o último código gerado para esta área/subárea
        const lastBook = await booksModel.getLastBookByAreaAndSubarea(area, parseInt(subarea, 10));
        let seq = "01";
        
        if (lastBook && lastBook.code) {
            // Extrai o número sequencial do último código
            const parts = lastBook.code.split(".");
            if (parts.length >= 2) {
                const lastSeq = parseInt(parts[1], 10);
                seq = (lastSeq + 1).toString().padStart(2, "0");
            }
        }
        // Monta o código final
        return `${areaCode}-${subareaCode}.${seq}.${vol}`;
    }

    /**
     * Adiciona um novo livro ou exemplar.
     * @param {Object} bookData - Dados do livro a ser adicionado
     * @returns {Promise<Object>} Objeto com id, código e exemplar
     */
    async addBook(bookData) {
        const {
            area,
            subarea,
            authors,
            edition,
            language,
            volume,
            title,
            subtitle,
            selectedBook,
            newVolume,
            isNewVolume
        } = bookData;

        console.log("DEBUG - FULL bookData:", JSON.stringify(bookData));

        const subareaInt = parseInt(subarea, 10);
        let code;
        let exemplarNumber = 1;

        if (selectedBook && selectedBook.code) {
            if (isNewVolume) {
                // Novo volume: mantém o mesmo sequencial, só altera o volume
                const codeParts = selectedBook.code.split(".");
                if (codeParts.length === 3) {
                    code = `${codeParts[0]}.${codeParts[1]}.${String(newVolume).padStart(2, "0")}`;
                } else {
                    // fallback: gera novo código (não deve acontecer)
                    code = await this.generateBookCode({ area, subarea, volume: newVolume });
                }
                console.log(`NEW VOLUME: Generated code ${code}`);
            } else {
                // Novo exemplar: usa o mesmo código do livro selecionado
                code = selectedBook.code;
                const result = await booksModel.getMaxExemplarByCode(code);
                exemplarNumber = (result && result.maxExemplar ? result.maxExemplar : 0) + 1;
                console.log(`NEW EXEMPLAR: Using code ${code}, exemplar ${exemplarNumber}`);
            }
        } else {
            // Novo livro: gera um novo código
            code = await this.generateBookCode({ area, subarea, volume });
            console.log(`NEW BOOK: Generated code ${code}`);
        }
        
        // Cria objeto com dados do livro para ser inserido no modelo
        const bookToInsert = {
            area,
            subarea: subareaInt,
            authors,
            edition,
            language,
            volume: isNewVolume ? newVolume : volume,
            exemplar: exemplarNumber,
            code,
            title,
            subtitle,
        };

        // Chama o modelo para inserir no banco de dados
        const result = await booksModel.insertBook(bookToInsert);
        return { id: result, code, exemplar: exemplarNumber };
    }

    /**
     * Busca livros por categoria e subcategoria.
     * @param {string} category - Nome da área (ex: "Física")
     * @param {number} subcategory - Código da subárea (ex: 1)
     * @returns {Promise<Array>} Lista de livros encontrados
     */
    async getBooks(category, subcategory) {
        return await booksModel.getBooks(category, subcategory);
    }

    /**
     * Busca um livro pelo seu ID.
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Livro encontrado
     */
    async getBookById(id) {
        return await booksModel.getBookById(id);
    }

    /**
     * Retorna os mapeamentos de códigos de área e subárea
     * @returns {Object} Objeto com areaCodes e subareaCodes
     */
    getCategoryMappings() {
        return {
            areaCodes,
            subareaCodes
        };
    }
}

// Exporta uma instância única do serviço
module.exports = new BooksService();