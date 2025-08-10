// Retorna o formato "número - nome" da subárea
export function getResolvedSubarea(area: string | number, subarea: string | number, subareaCodes?: Record<string, Record<string, string | number>>): string | number {
  try {
    if (!subarea || !area || !subareaCodes) return subarea;
    const areaMap = subareaCodes[area];
    if (!areaMap) return subarea;
    const entry = Object.entries(areaMap).find(([_, value]) => Number(value) === Number(subarea));
    if (entry) {
      // entry[0] = nome, entry[1] = número
      return `${entry[1]} - ${entry[0]}`;
    }
    return subarea;
  } catch {
    return subarea;
  }
}
