import { Button } from "@/components/ui/button";
import { getResolvedSubarea } from "@/utils/bookUtils";
import { BookOption, SubareaCode } from "../types/book";
import NudgeButton from "./NudgeButton";
import { BookOpen, Pi, Atom, Dna, Braces, Orbit  } from "lucide-react";
import React from "react";

interface BookCard2Props {
  book: any;
  areaCodes: Record<string, string>;
  subareaCodes: SubareaCode;
  loadingBookDetails: boolean;
  onDetails: (book: any) => void;
}

// Função para retornar o ícone da área
const areaIcon = (area: string) => {
  switch (area) {
    case "Biologia":
      return <Dna size={32} className="text-cm-green" />;
    case "Química":
      return <Atom size={32} className="text-cm-yellow" />;
    case "Física":
      return <Orbit size={32} className="text-cm-orange" />;
    case "Matemática":
      return <Pi size={32} className="text-cm-red" />;
    case "Computação":
      return <Braces size={32} className="text-cm-blue" />;
    default:
      return <BookOpen size={32} className="text-library-purple" />;
  }
};

// Cores de status
const statusStyles = (book: BookCard2Props["book"]) => {
  if (book.overdue) return { label: "Atrasado", color: "text-red-600" };
  if (book.is_reserved) return { label: "Reservado", color: "text-purple-700" };
  if (book.is_extended) return { label: "Estendido", color: "text-orange-500" };
  if (book.exemplaresDisponiveis === 0) return { label: "Emprestado", color: "text-yellow-600" };
  return { label: "Disponível", color: "text-green-700" };
};

const BookCard2: React.FC<BookCard2Props> = ({ book, areaCodes, subareaCodes, loadingBookDetails, onDetails }) => {

  const areaLabel = areaCodes[book.area] || "Área desconhecida";
  const areaStyle = areaIcon(book.area);
  const status = statusStyles(book);

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl shadow border border-gray-200 p-3 min-h-20 transition-all hover:shadow-md">
      {/* Ícone da área com fundo colorido */}
      <div className={`flex items-center justify-center w-14 h-14`}>
        {areaStyle}
      </div>
      {/* Conteúdo compacto */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 break-words">
          <span className="font-semibold text-base whitespace-normal break-words">{book.title}</span>
          {book.volume && <span className="text-xs text-gray-500 whitespace-normal">Vol. {book.volume}</span>}
          <span className="text-xs text-gray-700 whitespace-normal break-words">{book.authors}</span>
          <span className="text-xs text-gray-500 whitespace-normal break-words">
            {areaLabel}{book.subarea ? ` / ${getResolvedSubarea(book.area, book.subarea, subareaCodes)}` : ""}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className={`font-semibold text-xs ${status.color}`}>{status.label}</span>
          {book.totalExemplares > 0 && (
            <span className="text-xs text-gray-600">{book.exemplaresDisponiveis}/{book.totalExemplares} disp.</span>
          )}
          <button
            className="rounded bg-white text-library-purple border-library-purple hover:bg-library-purple-muted hover:text-white px-2 py-1 text-xs"
            onClick={() => onDetails(book)}
            disabled={loadingBookDetails}
          >
            {loadingBookDetails ? '...' : 'Detalhes'}
          </button>
        </div>
        {/* Botão de nudge para livros atrasados ou na janela final ou estendidos*/}
        {(book.overdue || book.due_in_window || book.is_extended) ? (
          <div className="flex justify-end mt-1">
            <NudgeButton book={book} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BookCard2;
