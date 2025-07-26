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
  const [loanInfo, setLoanInfo] = useState<any>(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState("");
  const [nudgeError, setNudgeError] = useState("");
  const [nudgeTimestamp, setNudgeTimestamp] = useState<string | null>(null);

  if (!book) return null;

  console.log("🔵 [BookDetailsModal] Renderizando modal para livro:", book?.title);

  // Carrega informações de empréstimo quando um livro é selecionado
  useEffect(() => {
    if (book && !book.available) {
      const nudgeKey = `nudge_${book.id}`;
      setNudgeTimestamp(localStorage.getItem(nudgeKey));
      fetchLoanInfo(book.id);
    } else {
      setLoanInfo(null);
      setNudgeTimestamp(null);
    }
  }, [book]);

  const fetchLoanInfo = async (bookId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/books/${bookId}/loan-info`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setLoanInfo(data);
      }
    } catch (error) {
      console.error("🔴 [BookDetailsModal] Erro ao buscar informações de empréstimo:", error);
    }
  };

  const isOverdue = (loanInfo: any) => {
    if (!loanInfo?.due_date) return false;
    return new Date(loanInfo.due_date) < new Date();
  };

  const canNudge = () => {
    if (!nudgeTimestamp) return true;
    const last = new Date(nudgeTimestamp);
    return (Date.now() - last.getTime()) > 24 * 60 * 60 * 1000;
  };

  const handleNudge = async () => {
    if (!loanInfo) return;
    setNudgeLoading(true);
    setNudgeError("");
    setNudgeSuccess("");
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
      const requester_name = currentUser?.name || undefined;
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: loanInfo.student_id,
          type: "nudge",
          message: "nudge",
          sendEmail: true,
          metadata: {
            book_title: book.title,
            book_id: book.id,
            loan_id: loanInfo.loan_id,
            requester_name
          }
        })
      });
      if (!res.ok) throw new Error("Erro ao cutucar usuário");
      const nudgeKey = `nudge_${book.id}`;
      localStorage.setItem(nudgeKey, new Date().toISOString());
      setNudgeTimestamp(new Date().toISOString());
      setNudgeSuccess("Cutucada enviada com sucesso!");
    } catch (e: any) {
      setNudgeError(e.message || "Erro ao cutucar");
    } finally {
      setNudgeLoading(false);
    }
  };

  const getAvailabilityDisplay = () => {
    // Para livros com múltiplos exemplares (como no BookSearchPanel)
    if (book.totalExemplares && book.exemplaresDisponiveis !== undefined) {
      return {
        text: book.exemplaresDisponiveis > 0 ? "Disponível" : "Emprestado",
        className: book.exemplaresDisponiveis > 0 ? "text-cm-green" : "text-cm-red",
        showCount: book.totalExemplares > 1,
        countText: `${book.exemplaresDisponiveis}/${book.totalExemplares} exemplares disponíveis`
      };
    }
    
    // Para livros simples (como no VirtualBookshelfPanel)
    return {
      text: book.available ? "Disponível" : "Emprestado",
      className: book.available ? "text-cm-green" : "text-cm-red",
      showCount: false,
      countText: ""
    };
  };

  const availability = getAvailabilityDisplay();
  const shouldShowNudge = () => {
    // Para livros com múltiplos exemplares
    if (book.totalExemplares && book.exemplaresDisponiveis !== undefined) {
      return book.exemplaresDisponiveis < book.totalExemplares && loanInfo && isOverdue(loanInfo);
    }
    // Para livros simples
    return !book.available && loanInfo && isOverdue(loanInfo);
  };

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
              <p className={`font-semibold ${availability.className}`}>
                {availability.text}
              </p>
              {availability.showCount && (
                <p className="mt-2 text-sm">{availability.countText}</p>
              )}
            </>
          )}

          {/* Botão de cutucar para livros atrasados */}
          {shouldShowNudge() && (
            <div className="mt-4">
              <Button
                className="bg-cm-blue text-white"
                disabled={!canNudge() || nudgeLoading}
                onClick={handleNudge}
              >
                {nudgeLoading ? "Enviando..." : canNudge() ? "Cutucar" : "Aguarde 1 dia"}
              </Button>
              {nudgeSuccess && <div className="text-green-600 mt-2">{nudgeSuccess}</div>}
              {nudgeError && <div className="text-red-600 mt-2">{nudgeError}</div>}
            </div>
          )}
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
