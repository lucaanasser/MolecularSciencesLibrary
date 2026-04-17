/**
 * Responsabilidade: mapeamento estatico codigo_unidade -> campus.
 * Camada: service/shared do bloco disciplines.
 * Entradas/Saidas: codigo de unidade numerico; retorna string de campus.
 * Dependencias criticas: nenhuma.
 */

const campusPorUnidade = {
    86: 'São Paulo', 27: 'São Paulo', 39: 'São Paulo', 7: 'São Paulo',
    22: 'São Paulo', 3: 'São Paulo', 16: 'São Paulo', 9: 'São Paulo',
    2: 'São Paulo', 12: 'São Paulo', 48: 'São Paulo', 8: 'São Paulo',
    5: 'São Paulo', 10: 'São Paulo', 67: 'São Paulo', 23: 'São Paulo',
    6: 'São Paulo', 66: 'São Paulo', 14: 'São Paulo', 26: 'São Paulo',
    93: 'São Paulo', 41: 'São Paulo', 92: 'São Paulo', 42: 'São Paulo',
    4: 'São Paulo', 37: 'São Paulo', 43: 'São Paulo', 44: 'São Paulo',
    45: 'São Paulo', 83: 'São Paulo', 47: 'São Paulo', 46: 'São Paulo',
    87: 'São Paulo', 21: 'São Paulo', 31: 'São Paulo', 85: 'São Paulo',
    71: 'São Paulo', 32: 'São Paulo', 38: 'São Paulo', 33: 'São Paulo',
    98: 'Ribeirão Preto', 94: 'Ribeirão Preto', 60: 'Ribeirão Preto',
    89: 'Ribeirão Preto', 81: 'Ribeirão Preto', 59: 'Ribeirão Preto',
    96: 'Ribeirão Preto', 91: 'Ribeirão Preto', 17: 'Ribeirão Preto',
    58: 'Ribeirão Preto', 95: 'Ribeirão Preto',
    88: 'Lorena',
    18: 'São Carlos', 97: 'São Carlos', 99: 'São Carlos', 55: 'São Carlos',
    76: 'São Carlos', 75: 'São Carlos', 90: 'São Carlos',
    11: 'Piracicaba', 64: 'Piracicaba',
    25: 'Bauru', 61: 'Bauru',
    74: 'Pirassununga',
    30: 'São Sebastião'
};

module.exports = {
    campusPorUnidade
};
