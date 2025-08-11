import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLoanRules } from "@/features/rules/hooks/useLoanRules";

interface NudgeButtonProps {
  book: any;
}

const NudgeButton: React.FC<NudgeButtonProps> = ({ book }) => {
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState("");
  const [nudgeError, setNudgeError] = useState("");
  const [nudgeTimestamp, setNudgeTimestamp] = useState<string | null>(null);
  const { rules } = useLoanRules();
  const cooldownHours = rules?.nudge_cooldown_hours ?? 24;

  useEffect(() => {
    setNudgeTimestamp(localStorage.getItem(`nudge_${book.id}`));
  }, [book.id]);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || '{}');
    } catch {
      return null;
    }
  })();
  const isOwner = currentUser && book.student_id && currentUser.id === book.student_id;

  const canNudge = () => {
    if (isOwner) return false;
    if (!nudgeTimestamp) return true;
    const last = new Date(nudgeTimestamp);
    return (Date.now() - last.getTime()) > cooldownHours * 60 * 60 * 1000;
  };

  const contextLabel = () => {
    if (book.overdue) return "(atrasado)";
    if (book.extended_phase) return "(estendido)";
    if (book.due_in_window) return "(últimos dias)";
    return "";
  };

  const handleNudge = async () => {
    setNudgeLoading(true);
    setNudgeError("");
    setNudgeSuccess("");
    try {
      if (!currentUser || !currentUser.id) throw new Error("Entre para cutucar");
      if (isOwner) throw new Error("Você não pode cutucar a si mesmo");
      const token = localStorage.getItem("token");
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
          loan_id: book.loan_id,
          metadata: {
            book_title: book.title,
            book_id: book.id,
            loan_id: book.loan_id,
            requester_name
          }
        })
      });
      if (!res.ok) throw new Error("Erro ao cutucar usuário");
      const nowIso = new Date().toISOString();
      localStorage.setItem(`nudge_${book.id}`, nowIso);
      setNudgeTimestamp(nowIso);
      setNudgeSuccess("Cutucada enviada!");
    } catch (e: any) {
      setNudgeError(e.message || "Erro ao cutucar");
    } finally {
      setNudgeLoading(false);
    }
  };

  const disabled = !canNudge() || nudgeLoading;
  return (
    <div className="flex flex-col items-end">
      <button
        className={`group flex items-center justify-center transition-all duration-200 bg-white font-semibold rounded-full focus:outline-none shadow-sm px-0 w-8 h-8 overflow-hidden hover:bg-cm-purple hover:text-white hover:px-4 hover:w-auto border ${book.extended_phase ? 'border-cm-orange' : 'border-cm-purple'} disabled:opacity-60 disabled:cursor-not-allowed`}
        style={{ minWidth: '2rem', minHeight: '2rem' }}
        disabled={disabled}
        onClick={handleNudge}
        type="button"
        title={!currentUser ? 'Entre para cutucar' : disabled ? 'Aguarde cooldown' : 'Cutucar'}
      >
        <span className="flex items-center justify-center w-full h-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5 flex-shrink-0 transition-colors duration-200 text-cm-purple group-hover:text-white fill-current"
          >
            <path d="M10 3.914V.5h2v3.414zM7.414 5.5L5 3.084L3.586 4.499L6 6.913zM11 4.81a2.26 2.26 0 0 0-2.26 2.26v8.064l-2.677-.529a1.88 1.88 0 0 0-1.927.802l-.95 1.425l4.299 5.591A2.76 2.76 0 0 0 9.67 23.5h7.086c1.187 0 2.24-.76 2.615-1.886l1.783-5.35a2.76 2.76 0 0 0-1.226-3.252l-3.625-2.116a2.76 2.76 0 0 0-1.39-.376H13.26V7.07A2.26 2.26 0 0 0 11 4.81m6-1.725l-2.414 2.414L16 6.913L18.414 4.5z"/>
          </svg>
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-xs">
            {nudgeLoading ? "Cutucando..." : canNudge() ? `Cutucar ${contextLabel()}` : "Cooldown"}
          </span>
        </span>
      </button>
      {nudgeSuccess && <div className="text-green-600 mt-2 text-xs">{nudgeSuccess}</div>}
      {nudgeError && <div className="text-red-600 mt-2 text-xs">{nudgeError}</div>}
    </div>
  );
};

export default NudgeButton;