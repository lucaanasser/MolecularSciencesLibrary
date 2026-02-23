/**
 * Logo colorido do Molecoogle.
 *
 * Props:
 * - fontSize (opcional): Classe de tamanho da fonte.
 * - pagination (opcional): Ativa modo interativo para paginação.
 * - pages, currentPage, onPageClick (opcionais): Usados para integração com paginação.
 */

// Definição de tipo para letras
type Letter = { char: string; color: string; pageIndex?: number };

// Função auxiliar para montar o array final de letras
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

// Props do logo
type LogoProps = {
  fontSize?: string;
  onLogoClick?: () => void;
  pagination?: boolean;
  pages?: number[];
  currentPage?: number;
  onPageClick?: (page: number) => void;
}

// Renderização do logo
export default function MolecoogleLogo(props: LogoProps) {
  
  // Desestruturação de props
  const fontSize = props.fontSize || "text-4xl";
  const onLogoClick = props.onLogoClick || undefined;

  const pagination = props.pagination || false;
  const pages = props.pages || [0, 1];
  const currentPage = props.currentPage || 0;
  const onPageClick = props.onPageClick || undefined;
  const isPageClickable = (l: Letter) => pagination && l.pageIndex !== undefined && onPageClick;

  // Geração das letras do logo
  const letters = getLogoLetters(pages, currentPage);

  return (
    <span
      className="flex items-top gap-0"
      onClick={() => onLogoClick()}
      style={onLogoClick ? { cursor: "pointer" } : { cursor: "default" }}
    >
      {letters.map((l, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: isPageClickable(l) || onLogoClick ? "pointer" : "default"
          }}
          aria-label={isPageClickable(l) ? `Página ${l.pageIndex}` : undefined}
          onClick={() => onPageClick && onPageClick(l.pageIndex)}
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
          {isPageClickable(l) && (
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