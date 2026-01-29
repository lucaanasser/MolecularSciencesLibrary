import { useTypewriterAreas } from "@/hooks/useTypewriterAreas";

const HERO_AREAS = [
  { name: "Matemática", color: "text-cm-red" },
  { name: "Física", color: "text-cm-orange" },
  { name: "Química", color: "text-cm-yellow" },
  { name: "Biologia", color: "text-cm-green" },
  { name: "Computação", color: "text-cm-blue" },
  { name: "Universo", color: "text-library-purple" },
];

export function LibraryHeroText() {
  const { areaIndex, displayText } = useTypewriterAreas(HERO_AREAS);
  const artigo = HERO_AREAS[areaIndex].name === "Universo" ? "o " : "a ";
  return (
    <>
      Abra um livro,<br />
      <span className="inline lg:inline">desvende </span>
      <br className="block lg:hidden" />
      <span>{artigo}</span>
      <span
        className={`destaque border-r-2 border-current pr-2 transition-colors duration-500 ${HERO_AREAS[areaIndex].color}`}
      >
        {displayText}
      </span>
    </>
  );
}

export { HERO_AREAS };
