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
        {/* Ícone de dedo cutucando (SVG Font Awesome) */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className="w-5 h-5 flex-shrink-0">
          <path d="M192 128L192 305.6C197.2 304.6 202.5 304 208 304L224 304L224 128C224 119.2 216.8 112 208 112C199.2 112 192 119.2 192 128zM208 352C190.3 352 176 366.3 176 384L176 408C176 474.3 229.7 528 296 528L344 528C396.5 528 441.1 494.3 457.4 447.3C454.3 447.8 451.2 448 448 448C428 448 410.1 438.8 398.3 424.4C389.3 429.3 378.9 432 368 432C352.9 432 339 426.7 328 418C317 426.8 303.1 432 288 432L248 432C234.7 432 224 421.3 224 408C224 394.7 234.7 384 248 384L288 384C296.8 384 304 376.8 304 368C304 359.2 296.8 352 288 352L208 352zM128 384L128 384C128 366 134 349.4 144 336L144 128C144 92.7 172.7 64 208 64C243.3 64 272 92.7 272 128L272 210C277.1 208.7 282.5 208 288 208C313.3 208 335.2 222.7 345.6 244C352.6 241.4 360.1 240 368 240C388 240 405.9 249.2 417.7 263.6C426.7 258.7 437.1 256 448 256C483.3 256 512 284.7 512 320L512 408C512 500.8 436.8 576 344 576L296 576C203.2 576 128 500.8 128 408L128 384zM464 320C464 311.2 456.8 304 448 304C439.2 304 432 311.2 432 320L432 384C432 392.8 439.2 400 448 400C456.8 400 464 392.8 464 384L464 320zM288 304C293.5 304 298.9 304.7 304 306L304 272C304 263.2 296.8 256 288 256C279.2 256 272 263.2 272 272L272 304L288 304zM352 328L352 368C352 376.8 359.2 384 368 384C376.8 384 384 376.8 384 368L384 304C384 295.2 376.8 288 368 288C359.2 288 352 295.2 352 304L352 328z"/>
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
