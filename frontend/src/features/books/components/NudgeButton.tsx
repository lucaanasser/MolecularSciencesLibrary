import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NudgeButtonProps {
  book: any;
}

const NudgeButton: React.FC<NudgeButtonProps> = ({ book }) => {
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState("");
  const [nudgeError, setNudgeError] = useState("");
  const [nudgeTimestamp, setNudgeTimestamp] = useState<string | null>(localStorage.getItem(`nudge_${book.id}`));

  const canNudge = () => {
    if (!nudgeTimestamp) return true;
    const last = new Date(nudgeTimestamp);
    return (Date.now() - last.getTime()) > 24 * 60 * 60 * 1000;
  };

  const handleNudge = async () => {
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
          user_id: book.student_id,
          type: "nudge",
          message: "nudge",
          sendEmail: true,
          metadata: {
            book_title: book.title,
            book_id: book.id,
            loan_id: book.loan_id,
            requester_name
          }
        })
      });
      if (!res.ok) throw new Error("Erro ao cutucar usuário");
      localStorage.setItem(`nudge_${book.id}`, new Date().toISOString());
      setNudgeTimestamp(new Date().toISOString());
      setNudgeSuccess("Cutucada enviada com sucesso!");
    } catch (e: any) {
      setNudgeError(e.message || "Você precisa estar logado para cutucar!");
    } finally {
      setNudgeLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        className={`group flex items-center transition-all duration-200 bg-cm-purple text-white font-semibold rounded-full focus:outline-none shadow-sm px-0 w-8 h-8 overflow-hidden hover:px-4 hover:w-auto disabled:opacity-60 disabled:cursor-not-allowed`}
        style={{ minWidth: '2rem', minHeight: '2rem' }}
        disabled={!canNudge() || nudgeLoading}
        onClick={handleNudge}
        type="button"
        title={canNudge() ? 'Cutucar' : 'Cutucado'}
      >
        {/* Ícone de dedo cutucando (SVG) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 flex-shrink-0"
        >
          <path d="M7.75 2.75a.75.75 0 0 1 1.5 0v7.5a.25.25 0 0 0 .5 0V7.5a.75.75 0 0 1 1.5 0v2.75a.25.25 0 0 0 .5 0V9.5a.75.75 0 0 1 1.5 0v3.25c0 .138.112.25.25.25s.25-.112.25-.25V11.5a.75.75 0 0 1 1.5 0v3.25c0 1.243-1.007 2.25-2.25 2.25H9.5a3.25 3.25 0 0 1-3.25-3.25V7.75a.75.75 0 0 1 1.5 0v2.5a.25.25 0 0 0 .5 0v-7.5Z" />
        </svg>
        {/* Texto aparece ao hover */}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-xs">
          {nudgeLoading ? "Enviando..." : canNudge() ? "Cutucar" : "Cutucado"}
        </span>
      </button>
      {nudgeSuccess && <div className="text-green-600 mt-2 text-xs">{nudgeSuccess}</div>}
      {nudgeError && <div className="text-red-600 mt-2 text-xs">{nudgeError}</div>}
    </div>
  );
};

export default NudgeButton;
