/**
 * Rail lateral da aba Emails (estilo Gmail): pastas da caixa de contato@ com
 * contadores + secao de avisos internos (antiga aba Notificacoes).
 * Usado em: EmailsInbox.
 */
import { Inbox, Send, Archive, ShieldAlert, BellPlus, History } from "lucide-react";
import type { EmailFolderCounts, EmailsTabView } from "../types/email";

interface Props {
  selected: EmailsTabView;
  counts: EmailFolderCounts | null;
  onSelect: (view: EmailsTabView) => void;
}

type RailItem = { id: EmailsTabView; label: string; icon: React.ElementType };

const FOLDER_ITEMS: RailItem[] = [
  { id: "inbox", label: "Caixa de entrada", icon: Inbox },
  { id: "sent", label: "Enviados", icon: Send },
  { id: "archived", label: "Arquivados", icon: Archive },
  { id: "quarantine", label: "Quarentena", icon: ShieldAlert },
];

const NOTIFICATION_ITEMS: RailItem[] = [
  { id: "notify", label: "Enviar aviso", icon: BellPlus },
  { id: "history", label: "Histórico de avisos", icon: History },
];

export default function EmailFolderRail({ selected, counts, onSelect }: Props) {
  /* Um botao do rail; contador so existe nas pastas de email. */
  const renderItem = ({ id, label, icon: Icon }: RailItem) => {
    const active = selected === id;
    const count = counts && id in counts ? counts[id as keyof EmailFolderCounts] : 0;
    const highlight = id === "inbox" && (counts?.unread ?? 0) > 0;
    return (
      <button
        key={id}
        onClick={() => onSelect(id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-colors ${
          active ? "primary-bg text-white font-semibold" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 truncate">{label}</span>
        {count > 0 && (
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              active ? "bg-white/20" : highlight ? "bg-cm-blue/10 text-cm-blue font-semibold" : "bg-gray-100"
            }`}
          >
            {id === "inbox" && highlight ? counts?.unread : count}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav className="w-44 shrink-0 flex flex-col gap-1">
      {FOLDER_ITEMS.map(renderItem)}
      <div className="mt-3 mb-1 px-3 text-xs uppercase tracking-wide text-gray-400">Avisos internos</div>
      {NOTIFICATION_ITEMS.map(renderItem)}
    </nav>
  );
}
