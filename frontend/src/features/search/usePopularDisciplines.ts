export function usePopularDisciplines() {
  // Pode futuramente buscar de uma API
  const popularDisciplines = [
    { codigo: "MAC0110", nome: "Introdução à Computação" },
    { codigo: "MAT0111", nome: "Cálculo Diferencial e Integral I" },
    { codigo: "4302111", nome: "Física I" },
  ];
  return { popularDisciplines };
}
