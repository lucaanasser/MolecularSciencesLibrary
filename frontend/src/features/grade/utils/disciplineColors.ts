/**
 * Helpers de cor para a grade. As disciplinas recebem cores de SCHEDULE_COLORS
 * (indexadas pela posição na lista). Aqui derivamos as variações suaves usadas
 * na UI: fundo pastel (tint) e texto/realce mais escuro para contraste.
 */

export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [1, 170, 208];
}

/** Fundo pastel: cor com baixa opacidade sobre branco. */
export function tint(hex: string, alpha = 0.14): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Versão mais escura da cor (para texto sobre fundo claro). */
export function shade(hex: string, factor = 0.72): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}
