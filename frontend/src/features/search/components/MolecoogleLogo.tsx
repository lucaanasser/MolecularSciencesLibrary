import React from "react";

/* Definição de tipo para letras */
type Letter = { char: string; color: string; pageIndex?: number };

/* Função auxiliar para montar o array final de letras */
function getLogoLetters(pages: number[], currentPage: number): Letter[] {
  const prefix: Letter[] = [
    { char: "M", color: "#4285F4" },
    { char: "o", color: "#EA4335" },
    { char: "l", color: "#FBBC05" },
    { char: "e", color: "#4285F4" },
    { char: "c", color: "#34A853" },
  ];
  const suffix: Letter[] = [
    { char: "g", color: "#4285F4" },
    { char: "l", color: "#34A853" },
    { char: "e", color: "#EA4335" },
  ];
  const oLetters: Letter[] = pages.map((page) => ({
    char: "o",
    color: page === currentPage ? "#EA4335" : "#FBBC05",
    pageIndex: page
  }));
  return [...prefix, ...oLetters, ...suffix];
}

/* Props do logo */
type LogoProps =
  | { pagination: true; 
      fontSize?: string
      pages: number[]; 
      currentPage: number; 
      onClick: (page: number) => void; 
      onClickLogo?: () => void;
    }
  | { pagination?: false; fontSize?: string; onClickLogo?: () => void };

/* Componente do logo */
export const MolecoogleLogo: React.FC<LogoProps> = (props) => {
  const fontSize = props.fontSize || "text-4xl";
  const pagination = props.pagination === true;
  const currentPage = pagination ? props.currentPage : 0;
  const onClick = pagination ? props.onClick : undefined;
  const letters = getLogoLetters(pagination ? props.pages : [0, 1], currentPage);
  const cursorStyle = (pagination && props.onClick || props.onClickLogo ? { cursor: "pointer" } : {cursor: "default"});

  return (
    <span
      className="flex items-top gap-0"
      onClick={props.onClickLogo}
      style={cursorStyle}
    >
      {letters.map((l, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: cursorStyle.cursor
          }}
          aria-label={pagination && l.char === "o" && l.pageIndex !== undefined ? `Página ${l.pageIndex}` : undefined}
          onClick={pagination && l.char === "o" && l.pageIndex !== undefined && onClick ? () => onClick(l.pageIndex) : undefined}
        >
          <span
            style={{
              color: l.color,
              fontWeight: "bold",
            }}
            className={fontSize}
          >
            {l.char}
          </span>
          {pagination && i >= 5 && l.char === "o" && l.pageIndex !== undefined && (
            <span
              style={{
                color: l.pageIndex === currentPage ? "#000000" : "#4285F4",
              }}
              className={`prose-sm font-medium ${l.pageIndex != currentPage ? "hover:underline" : ""}`}
            >
              {l.pageIndex}
            </span>
          )}
        </div>
      ))}
    </span>
  );
};