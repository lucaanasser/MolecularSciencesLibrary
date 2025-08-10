import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SubareaCode } from "../types/book";

const LANGUAGE_MAP: Record<string | number, string> = {
  1: "Português",
  2: "Inglês",
  3: "Espanhol",
  4: "Outros Idiomas"
};

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

  // Determinar status e cores (mesma lógica do BookSearchPanel)
  const statusInfo = (() => {
    let label = "Disponível";
    let classes = "bg-cm-green text-white";
    if (book.overdue) {
      label = "Atrasado";
      classes = "bg-cm-red text-white";
    } else if (book.is_reserved) {
      label = "Reservado";
      classes = "bg-purple-700 text-white";
    } else if ((book.exemplaresDisponiveis !== undefined && book.exemplaresDisponiveis === 0) || (!book.exemplaresDisponiveis && !book.available)) {
      label = "Emprestado";
      classes = "bg-yellow-400 text-white";
    }
    return { label, classes };
  })();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-2xl font-bebas mb-2">{book.title}</h3>
        <div className="mb-4 text-gray-600">
          <p>Autor: {book.authors}</p>
            <p>Código: {book.code}</p>
            <p>Área: {book.area}</p>
            <p>Subárea: {resolvedSubarea}</p>
            <p>Idioma: {LANGUAGE_MAP[Number(book.language)] || LANGUAGE_MAP[book.language] || book.language || '—'}</p>
          
          {showAvailabilityText && (
            <div className="mt-3">
              {/* Badge de status com cores padronizadas */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.classes}`}>{statusInfo.label}</span>
              {book.totalExemplares > 1 && (
                <p className="mt-2 text-sm">{`${book.exemplaresDisponiveis}/${book.totalExemplares} exemplares disponíveis`}</p>
              )}
            </div>
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
  );
};

export default BookDetailsModal;
