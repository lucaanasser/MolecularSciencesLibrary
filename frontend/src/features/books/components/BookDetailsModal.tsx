import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BookDetailsModalProps {
  book: any;
  onClose: () => void;
  showAvailabilityText?: boolean;
  showVirtualShelfButton?: boolean;
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
}) => {
  const navigate = useNavigate();
  // ...existing code...

  if (!book) return null;

  console.log("🔵 [BookDetailsModal] Renderizando modal para livro:", book?.title);

  // ...existing code...

  // ...existing code...

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-2xl font-bebas mb-2">{book.title}</h3>
        <div className="mb-4 text-gray-600">
          <p>Autor: {book.authors}</p>
          <p>Código: {book.code}</p>
          <p>Área: {book.area}</p>
          <p>Subárea: {book.subarea}</p>
          
          {showAvailabilityText && (
            <>
              <p className="font-semibold">
                {book.exemplaresDisponiveis !== undefined && book.totalExemplares !== undefined
                  ? `${book.exemplaresDisponiveis > 0 ? "Disponível" : "Emprestado"}`
                  : book.available ? "Disponível" : "Emprestado"}
              </p>
              {book.totalExemplares > 1 && (
                <p className="mt-2 text-sm">{`${book.exemplaresDisponiveis}/${book.totalExemplares} exemplares disponíveis`}</p>
              )}
            </>
          )}

          {/* ...existing code... */}
        </div>
        
        <div className="flex justify-between gap-2 mt-4">
          {showVirtualShelfButton && (
            <button
              onClick={() => {
                navigate(`/estante-virtual?highlight=${encodeURIComponent(book.code)}`);
              }}
              className="bg-cm-blue text-white px-4 py-2 rounded-xl hover:bg-cm-blue/80"
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
