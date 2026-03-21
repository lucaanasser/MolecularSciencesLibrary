/**
 * Responsabilidade: centralizar constantes de classificacao da estante virtual.
 * Camada: service.
 * Entradas/Saidas: fornece ordem de areas e mapa de nomes para codigos.
 * Dependencias criticas: nenhuma.
 */

const AREA_ORDER = ['BIO', 'QUI', 'FIS', 'MAT', 'CMP', 'VAR'];

const AREA_NAME_TO_CODE = {
    'Biologia': 'BIO',
    'Química': 'QUI',
    'Física': 'FIS',
    'Matemática': 'MAT',
    'Computação': 'CMP',
    'Variados': 'VAR'
};

module.exports = {
    AREA_ORDER,
    AREA_NAME_TO_CODE
};
