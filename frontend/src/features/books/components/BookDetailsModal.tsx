import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SubareaCode } from "../types/book";

interface BookDetailsModalProps {
  book: any;
  onClose: () => void;
  showAvailabilityText?: boolean;
  showVirtualShelfButton?: boolean;
  subareaCodes?: SubareaCode; // novo
}

/**
 * Modal reutilizável para exibir detalhes de um livro
 * Inclui funcionalidade de nudge para livros atrasados
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  onClose,
  showAvailabilityText = true,
  showVirtualShelfButton = true,
  subareaCodes,
}) => {
  const navigate = useNavigate();
  // ...existing code...

  if (!book) return null;

  console.log("🔵 [BookDetailsModal] Renderizando modal para livro:", book?.title);

  // Resolver nome da subárea a partir do número
  const resolvedSubarea = (() => {
    try {
      if (!book?.subarea || !book?.area || !subareaCodes) return book?.subarea;
      const areaMap = subareaCodes[book.area];
      if (!areaMap) return book.subarea;
      const entry = Object.entries(areaMap).find(([, value]) => Number(value) === Number(book.subarea));
      return entry ? entry[0] : book.subarea;
    } catch (e) {
      return book?.subarea;
    }
  })();

  // Determinar status e cores (mesma lógica do painel de busca)
  const { statusText, dotColor, textColor } = (() => {
    let statusText = "Disponível";
    let dotColor = "bg-cm-green";
    let textColor = "text-cm-green";
    const exemplaresIndisponiveis = (book.exemplaresDisponiveis === 0) || (!book.available && !book.overdue && !book.is_reserved);
    if (book.overdue) {
      statusText = "Atrasado";
      dotColor = "bg-cm-red";
      textColor = "text-cm-red";
    } else if (book.is_reserved) {
      statusText = "Reservado";
      dotColor = "bg-purple-700";
      textColor = "text-purple-700";
    } else if (exemplaresIndisponiveis) {
      statusText = "Emprestado";
      dotColor = "bg-yellow-400";
      textColor = "text-yellow-500";
    }
    return { statusText, dotColor, textColor };
  })();

 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative group bg-white rounded-2xl p-6 max-w-md w-full overflow-hidden">
        {/* Aba lateral de status */}
        <div
          className={`absolute left-0 top-0 h-full ${dotColor} w-3 group-hover:w-14 transition-all duration-300 flex items-center justify-center rounded-l-2xl`}
          aria-label={`Status: ${statusText}`}
        >
          <span className="text-white font-semibold text-[10px] tracking-widest transform -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
            {statusText.toUpperCase()}
          </span>
        </div>
        {/* Conteúdo deslocado para não sobrepor a aba */}
        <div className="pl-4">
          <h3 className="text-2xl font-bebas mb-2">{book.title}</h3>
          <div className="mb-4 text-gray-600">
            <p>Autor: {book.authors}</p>
            <p>Código: {book.code}</p>
            <p>Área: {book.area}</p>
            <p>Subárea: {resolvedSubarea}</p>
            {showAvailabilityText && (
              <>
                {/* Removido texto de status inline; já indicado pela aba */}
                {book.totalExemplares > 1 && (
                  <p className="mt-2 text-sm">{`${book.exemplaresDisponiveis}/${book.totalExemplares} exemplares disponíveis`}</p>
                )}
              </>
            )}
          </div>
          <div className="flex justify-between gap-2 mt-4">
            {showVirtualShelfButton && (
              <button
                onClick={() => {
                  navigate(`/estante-virtual?highlight=${encodeURIComponent(book.code)}`);
                }}
                className="bg-cm-purple text-white px-4 py-2 rounded-xl hover:bg-cm-purple/80"
              >
                Ver na Estante
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
