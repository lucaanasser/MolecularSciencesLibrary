/**
 * Rail de pastas da caixa de contato@ (estilo Gmail): Caixa de entrada, Enviados,
 * Arquivados e Quarentena, com contadores. Usado em: EmailsInbox.
 */
import { Inbox, Send, Archive, ShieldAlert } from "lucide-react";
import type { EmailFolder, EmailFolderCounts } from "../types/email";

interface Props {
  folder: EmailFolder;
  counts: EmailFolderCounts | null;
  onSelect: (folder: EmailFolder) => void;
}

const FOLDERS: Array<{ id: EmailFolder; label: string; icon: React.ElementType }> = [
  { id: "inbox", label: "Caixa de entrada", icon: Inbox },
  { id: "sent", label: "Enviados", icon: Send },
  { id: "archived", label: "Arquivados", icon: Archive },
  { id: "quarantine", label: "Quarentena", icon: ShieldAlert },
];

export default function EmailFolderRail({ folder, counts, onSelect }: Props) {
  return (
    <nav className="w-44 shrink-0 flex flex-col gap-1">
      {FOLDERS.map(({ id, label, icon: Icon }) => {
        const active = folder === id;
        const count = counts ? counts[id] : 0;
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
      })}
    </nav>
  );
}
