/**
 * Composer da aba Emails: resposta inline (sempre contato@) ou mensagem nova com
 * escolha de remetente — contato@ (conversacional, resposta volta para a caixa) ou
 * avisos@ (comunicado com template automatico, sem resposta) — destinatario
 * buscavel (RecipientPicker) ou broadcast para todos os usuarios.
 * Usado em: EmailThread (reply) e EmailsInbox (nova, dentro de Dialog).
 */
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RecipientPicker from "./RecipientPicker";

export interface ComposePayload {
  to?: string;
  subject?: string;
  message: string;
  sender: "contato" | "avisos";
  broadcast?: boolean;
}

interface Props {
  mode: "reply" | "new";
  sending: boolean;
  initialTo?: string;
  onSend: (data: ComposePayload) => Promise<void>;
}

const SENDERS = [
  { id: "contato" as const, label: "contato@", hint: "respostas chegam na caixa" },
  { id: "avisos" as const, label: "avisos@", hint: "comunicado, sem resposta" },
];

export default function EmailComposer({ mode, sending, initialTo, onSend }: Props) {
  const [to, setTo] = useState(initialTo ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState<"contato" | "avisos">("contato");
  const [broadcast, setBroadcast] = useState(false);

  const canSend =
    message.trim().length > 0 &&
    (mode === "reply" || (subject.trim().length > 0 && (broadcast || to.trim().length > 0)));

  /* Envia e limpa os campos; erro fica com o chamador (toast). */
  const handleSend = async () => {
    if (!canSend || sending) return;
    await onSend({
      to: to.trim(),
      subject: subject.trim(),
      message: message.trim(),
      sender: mode === "reply" ? "contato" : sender,
      broadcast: mode === "new" ? broadcast : false,
    });
    setTo("");
    setSubject("");
    setMessage("");
    setBroadcast(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {mode === "new" && (
        <>
          {/* Remetente define o tom do email e se cabe resposta. */}
          <div className="flex flex-col sm:flex-row gap-2">
            {SENDERS.map((s) => (
              <label
                key={s.id}
                className={`flex-1 flex items-center gap-2 p-2 rounded-md border cursor-pointer text-sm ${
                  sender === s.id ? "primary-border border-2 bg-gray-50" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="email-sender"
                  checked={sender === s.id}
                  onChange={() => setSender(s.id)}
                />
                <span>
                  <b>{s.label}</b> — {s.hint}
                </span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={broadcast}
              onChange={(e) => setBroadcast(e.target.checked)}
            />
            Enviar para todos os usuários da biblioteca
          </label>
          {!broadcast && <RecipientPicker value={to} onChange={setTo} />}
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
          {sending ? "Enviando..." : broadcast && mode === "new" ? "Enviar para todos" : mode === "reply" ? "Responder" : "Enviar"}
        </Button>
      </div>
    </div>
  );
}
