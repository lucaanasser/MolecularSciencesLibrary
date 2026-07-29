/**
 * Responsabilidade: paleta de cores compartilhada dos relatorios PDF.
 * Camada: service (utilities/pdfGenerator).
 * Entradas/Saidas: exporta o objeto de cores atribuido a this.colors pelo orquestrador.
 * Dependencias criticas: nenhuma.
 */

// Paleta de cores usada em todos os relatorios (equivalente ao this.colors original)
module.exports = {
    primary: '#6B21A8',      // library-purple
    secondary: '#1E40AF',    // cm-blue
    success: '#16A34A',      // cm-green
    warning: '#F59E0B',      // cm-yellow/orange
    danger: '#DC2626',       // cm-red
    dark: '#1F2937',
    light: '#F3F4F6',
    text: '#374151'
};
