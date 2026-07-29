/**
 * Composer da caixa de contato@: resposta inline (so mensagem) ou mensagem nova
 * (destinatario + assunto + mensagem). Tudo sai de contato@ via worker.
 * Usado em: EmailThread (reply) e EmailsInbox (nova, dentro de Dialog).
 */
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  mode: "reply" | "new";
  sending: boolean;
  onSend: (data: { to?: string; subject?: string; message: string }) => Promise<void>;
}

export default function EmailComposer({ mode, sending, onSend }: Props) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const canSend =
    message.trim().length > 0 && (mode === "reply" || (to.trim().length > 0 && subject.trim().length > 0));

  /* Envia e limpa os campos; erro fica com o chamador (toast). */
  const handleSend = async () => {
    if (!canSend || sending) return;
    await onSend({ to: to.trim(), subject: subject.trim(), message: message.trim() });
    setTo("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-2">
      {mode === "new" && (
        <>
          <Input
            type="email"
            placeholder="Para (email do destinatário)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Input placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </>
      )}
      <Textarea
        placeholder={mode === "reply" ? "Escreva sua resposta..." : "Escreva sua mensagem..."}
        rows={mode === "reply" ? 3 : 6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex justify-end">
        <Button variant="primary" size="sm" disabled={!canSend || sending} onClick={handleSend}>
          <Send className="w-4 h-4 mr-1" />
          {sending ? "Enviando..." : mode === "reply" ? "Responder" : "Enviar"}
        </Button>
      </div>
    </div>
  );
}
