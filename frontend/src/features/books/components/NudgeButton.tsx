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
      setNudgeError(e.message || "Erro ao cutucar");
    } finally {
      setNudgeLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <Button
        className="bg-cm-blue text-white"
        disabled={!canNudge() || nudgeLoading}
        onClick={handleNudge}
        size="sm"
      >
        {nudgeLoading ? "Enviando..." : canNudge() ? "Cutucar" : "Aguarde 1 dia"}
      </Button>
      {nudgeSuccess && <div className="text-green-600 mt-2 text-xs">{nudgeSuccess}</div>}
      {nudgeError && <div className="text-red-600 mt-2 text-xs">{nudgeError}</div>}
    </div>
  );
};

export default NudgeButton;
