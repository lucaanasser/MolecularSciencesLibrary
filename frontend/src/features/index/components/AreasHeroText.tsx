import { useTypewriterAreas } from "..";
import { AREAS, COLORS } from "@/constants";

const areas = (AREAS.slice(0,5) as string[]).concat("Universo").map((area, index) => ({
  name: area,
  color: COLORS[index % COLORS.length]
}));

export function AreasHeroText() {
  const { areaIndex, displayText } = useTypewriterAreas(areas);
  const artigo = areas[areaIndex].name === "Universo" ? "o " : "a ";
  return (
    <>
      Abra um livro,<br />
      <span className="inline lg:inline">desvende </span>
      <br className="block lg:hidden" />
      <span>{artigo}</span>
      <span
        className={`destaque border-r-2 border-current pr-2 transition-colors duration-500 text-${areas[areaIndex].color}`}
      >
        {displayText}
      </span>
    </>
  );
}

export { areas as HERO_AREAS };
