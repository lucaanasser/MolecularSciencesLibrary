import { ImagePath } from "@/types/user";
import { IMAGE_PATHS } from "@/constants/users";

/* Cores padrão */
export const COLORS = [
  "cm-red",
  "cm-orange",
  "cm-yellow",
  "cm-green",
  "cm-blue",
  "library-purple"
]

export const MUTED_COLORS = [
  "bg-cm-red/10",
  "bg-cm-orange/10",
  "bg-cm-yellow/10",
  "bg-cm-green/10",
  "bg-cm-blue/10",
  "bg-library-purple/10"
]

// Cor de acordo com a imagem de perfil do usuário
export function accentColor(imagePath: ImagePath): string {
  const index = IMAGE_PATHS.indexOf(imagePath);
  return index !== -1 ? COLORS[index] : COLORS[5]; // Roxo como fallback
}

// Cor de fundo suave de acordo com a cor principal
export function mutedColor(color: string): string {
  const index = COLORS.indexOf(color);
  return index !== -1 ? MUTED_COLORS[index] : MUTED_COLORS[5]; // Roxo claro como fallback
}

/* Ícones por área */
import { Book, Dna, Atom, Orbit, Pi, Braces } from "lucide-react";

export function AreaIcon({ area }: { area?: string }) {
  switch (area) {
    case "BIO":
      return <Dna className="w-8 md:w-10 h-auto text-cm-green" />;
    case "QUI":
      return <Atom className="w-8 md:w-10 h-auto text-cm-yellow" />;
    case "FIS":
      return <Orbit className="w-8 md:w-10 h-auto text-cm-orange" />;
    case "MAT":
      return <Pi className="w-8 md:w-10 h-auto text-cm-red" />;
    case "CMP":
      return <Braces className="w-8 md:w-10 h-auto text-cm-blue" />;
    default:
      return <Book className="w-8 md:w-10 h-auto text-library-purple" />;
  }
}
