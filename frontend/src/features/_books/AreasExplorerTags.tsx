import React from "react";

const TAGS = [
  { label: "Matemática", color: "bg-cm-red" },
  { label: "Física", color: "bg-cm-orange" },
  { label: "Química", color: "bg-cm-yellow" },
  { label: "Biologia", color: "bg-cm-green" },
  { label: "Computação", color: "bg-cm-blue" },
];

interface AreasExplorerTagsProps {
  onTagClick: (label: string) => void;
}

const AreasExplorerTags: React.FC<AreasExplorerTagsProps> = ({ onTagClick }) => (
  <>
    <p className="prose-sm">Explore por áreas:</p>

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
            onClick={() => onTagClick(tag.label)}
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
              className={`transition-all duration-300 rounded-full w-7 h-7 ${tag.color} group-hover:w-32 group-hover:px-4 group-hover:py-2 group-hover:shadow-lg flex items-center justify-center`}
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
  </>
);

export default AreasExplorerTags;
