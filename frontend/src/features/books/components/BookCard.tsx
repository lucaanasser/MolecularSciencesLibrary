import { Button } from "@/components/ui/button";
import NudgeButton from "./NudgeButton";
import { getResolvedSubarea } from "@/utils/bookUtils";
import React from "react";


import { SubareaCode } from "../types/book";

interface BookCardProps {
  book: any;
  areaCodes: Record<string, string>;
  subareaCodes: SubareaCode;
  loadingBookDetails: boolean;
  onDetails: (book: any) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, areaCodes, subareaCodes, loadingBookDetails, onDetails }) => {
  // Prioridade: atrasado > reservado > estendido > emprestado > disponível
  let color = "bg-cm-green";
  let text = "Disponível";
  let textColor = "text-white";
  if (book.overdue) {
    color = "bg-cm-red";
    text = "Atrasado";
  } else if (book.is_reserved) {
    color = "bg-purple-700";
    text = "Reservado";
  } else if (book.is_extended) {
    color = "bg-cm-orange";
    text = "Estendido";
  } else if (book.exemplaresDisponiveis === 0) {
    color = "bg-yellow-400";
    text = "Emprestado";
    textColor = "text-black";
  }

  return (
    <div className="relative group">
      {/* Aba lateral de status na esquerda */}
      <div className={`absolute left-0 top-0 h-full w-4 ${color} rounded-l-lg transition-all duration-300 ease-in-out group-hover:w-8 group-hover:-translate-x-4 translate-x-0 overflow-visible z-10 origin-left`}>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 h-full flex items-center justify-center">
          <span className={`${textColor} text-xs font-semibold transform -rotate-90 whitespace-nowrap`}>
            {text}
          </span>
        </div>
      </div>
      {/* Card do livro */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-300 hover:shadow-xl transition-shadow duration-200 min-h-72 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h4>
              {book.title}
              {book.volume && (
                <span className="ml-2 text-base text-gray-500">Vol. {book.volume}</span>
              )}
            </h4>
            <p className="mb-2">
              {book.authors}
            </p>
            <p className="smalltext">
              <span>
                {book.area && areaCodes && areaCodes[book.area] ? areaCodes[book.area] : (book.area || "Área desconhecida")}
                {book.subarea ? ` / ${getResolvedSubarea(book.area, book.subarea, subareaCodes)}` : ""}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm">
            {book.totalExemplares > 0 && (
              <>{book.exemplaresDisponiveis}/{book.totalExemplares} exemplares disponíveis</>
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-white text-library-purple border-library-purple hover:bg-library-purple-muted hover:text-white"
              onClick={() => onDetails(book)}
              disabled={loadingBookDetails}
            >
              {loadingBookDetails ? 'Carregando...' : 'Detalhes'}
            </Button>
          </div>
        </div>
        {/* Botão de nudge para livros atrasados ou na janela final ou estendidos*/}
        {(book.overdue || book.due_in_window || book.is_extended) ? (
          <div className="flex justify-end mt-2">
            <NudgeButton book={book} />
          </div>
        ) : (
          <div className="flex justify-end mt-2" style={{ visibility: 'hidden', height: '40px' }}>
            {/* Placeholder invisível para alinhar o conteúdo */}
            <div style={{ width: '40px', height: '40px' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
