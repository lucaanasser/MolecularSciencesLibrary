import { AREAS, COLORS } from "@/constants";
import { useNavigate } from "react-router-dom";

export default function AreasExplorerTags() {
  const navigate = useNavigate();

  const TAGS = AREAS.slice(0,5).map((area, idx) => ({
    label: area,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="prose-sm">Explore por área:</p>
      <div className="flex flex-wrap justify-center">
        {TAGS.map((tag, idx) => {
          // Proporção áurea: gap decrescente
          const phi = 1.618;
          const baseGap = 42;
          let gap = idx === 0 ? 0 : baseGap / Math.pow(phi, idx);
          if (gap < 0) gap = 0;
          const marginLeft = idx === 0 ? 0 : gap > 8 ? `${gap}px` : `-${16 - gap}px`;
          return (
            <button
              key={tag.label}
              onClick={() => {
                const params = new URLSearchParams({ area: tag.label });
                navigate(`/biblioteca/buscar/resultados?${params.toString()}`);
              }}
              className={`group relative flex items-center focus:outline-none`}
              style={{
                background: "none",
                border: "none",
                marginLeft: marginLeft,
                zIndex: TAGS.length - idx,
                position: "relative",
              }}
            >
              <span
                className={`transition-all duration-300 rounded-full w-7 h-7 bg-${tag.color} group-hover:w-32 group-hover:px-4 group-hover:py-2 group-hover:shadow-lg flex items-center justify-center`}
                style={{ position: "relative", overflow: "hidden" }}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center w-full h-full text-white prose-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
                  style={{ pointerEvents: "none" }}
                >
                  {tag.label}
                </span>
              </span>
              <style>{`
                .group:hover {
                  z-index: 40 !important;
                }
              `}</style>
            </button>
          );
        })}
      </div>
  </div>
  );
};