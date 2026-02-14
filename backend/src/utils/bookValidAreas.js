/* 
 * Mapeamentos das áreas e subáreas para os códigos usados no banco de dados.
 * Para centralizar a lógica de conversão e evitar hardcoding em múltiplos lugares,
 * toda nova área ou subárea deve ser adicionada aqui.
 */

// Nome da área -> Código da DB ("XXX")
const areaMapping = {
    "Física": "FIS",
    "Química": "QUI",
    "Biologia": "BIO",
    "Matemática": "MAT",
    "Computação": "CMP",
    "Variados": "VAR"
};

// Nome da subárea -> Código da DB (numérico)
const subareaMapping = {
    "FIS": { 
        "Física Geral": 1, 
        "Mecânica": 2, 
        "Termodinâmica": 3,
        "Eletromagnetismo": 4,
        "Física Moderna": 5,
        "Física Matemática": 6, 
        "Astronomia e Astrofísica": 7,
    },
    "QUI": { 
        "Química Geral": 1, 
        "Fisico-Química": 2, 
        "Química Inorgânica": 3,
        "Química Orgânica": 4,
        "Química Experimental": 5, 
    },
    "BIO": { 
        "Bioquímica": 1, 
        "Biologia Molecular e Celular": 2, 
        "Genética e Evolução": 3,
        "Biologia de Sistemas": 4,
        "Desenvolvimento": 5,
        "Ecologia": 6,
        "Botânica": 7,
    },
    "MAT": { 
        "Cálculo": 1,
        "Geometria Analítica": 2,
        "Álgebra Linear": 3,
        "Análise": 4,
        "Álgebra Abstrata": 5,
        "Topologia e Geometria": 6,
        "Lógica e Fundamentos": 7
    },
    "CMP": { 
        "Fundamentos de Computação": 1,
        "Algorítmos e Estruturas de Dados": 2,
        "Análise Numérica": 3,
        "Probabilidade e Estatística": 4, 
        "Teoria da Computação": 5,
        "Programação": 6,
        "Sistemas e Redes": 7
    },
    "VAR": { 
        "Divulgação Científica": 1,
        "Filosofia e História da Ciência": 2,
        "Handbooks e Manuais": 3,
        "Interdisciplinares": 4,
        "Miscelânea": 5, 
    }
};

// Função para validar área
function validateArea(area) {
    if (!areaMapping.hasOwnProperty(area)) {
        throw new Error(`Área inválida: '${area}'. Áreas válidas: ${Object.keys(areaMapping).join(', ')}`);
    }
    return areaMapping[area];
}

// Função para validar subárea
function validateSubarea(areaCode, subarea) {
    if (!subareaMapping.hasOwnProperty(areaCode)) {
        throw new Error(`Código de área inválido: '${areaCode}'.`);
    }
    if (!subareaMapping[areaCode].hasOwnProperty(subarea)) {
        throw new Error(`Subárea inválida: '${subarea}' para área '${areaCode}'. Subáreas válidas: ${Object.keys(subareaMapping[areaCode]).join(', ')}`);
    }
    return subareaMapping[areaCode][subarea];
}

module.exports = { areaMapping, subareaMapping, validateArea, validateSubarea };