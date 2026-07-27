/**
 * O que faz: define as constantes de tema (paleta de cores e dimensões da
 *            página A4) usadas pelo PDF avançado.
 * Camada: Apresentação (constantes de módulo).
 * Entradas/Saídas: nenhuma -> { COLORS, PAGE }.
 * Dependências críticas: nenhuma.
 * Efeitos colaterais: nenhum.
 */

const COLORS = {
    // Paleta principal inspirada no site Ciências Moleculares
    white: '#FFFFFF',
    pageBg: '#F9FAFB',
    text: '#111827',
    textMedium: '#374151',
    subtle: '#6B7280',
    subtleLight: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Verde principal (identidade CM)
    accent: '#16A34A',
    accentDark: '#15803D',
    accentMid: '#22C55E',
    accentSoft: '#DCFCE7',
    accentPale: '#F0FDF4',

    // Cores auxiliares para dots decorativos (logo CM)
    dotRed: '#EF4444',
    dotOrange: '#F97316',
    dotYellow: '#EAB308',
    dotBlue: '#3B82F6',

    // Sidebar e blocos
    sidebarBg: '#F0FDF4',
    sidebarBorder: '#BBF7D0',
    tagBg: '#16A34A',
    tagText: '#FFFFFF',
    cardBg: '#FFFFFF',
    highlightBg: '#F0FDF4'
};

// Dimensões da página A4
const PAGE = {
    width: 595,
    height: 842,
    margin: { top: 0, bottom: 40, left: 0, right: 0 },
    contentLeft: 50,
    contentRight: 545,
    contentWidth: 495,

    // Layout de duas colunas (corpo + sidebar)
    mainLeft: 50,
    mainWidth: 330,
    sideLeft: 410,
    sideWidth: 135
};

module.exports = { COLORS, PAGE };
