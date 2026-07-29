/**
 * Busca de destinatario por nome/NUSP/email entre os usuarios da biblioteca,
 * com sugestoes (debounce); tambem aceita email digitado livremente (externos).
 * Usado em: EmailComposer (modo "new"). Depende de: UsersService.searchUsers.
 */
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { logger } from "@/utils/logger";
import { UsersService } from "@/services/UsersService";
import type { User } from "@/types/user";

interface Props {
  value: string;
  onChange: (email: string) => void;
}

export default function RecipientPicker({ value, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  /* Busca usuarios com debounce enquanto digita. */
  const handleChange = (raw: string) => {
    onChange(raw);
    clearTimeout(timer.current);
    if (raw.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const users = await UsersService.searchUsers({ q: raw.trim() });
        const withEmail = users.filter((u: User) => u.email).slice(0, 6);
        setSuggestions(withEmail);
        setOpen(withEmail.length > 0);
      } catch (err) {
        logger.error("🔴 [RecipientPicker] Erro na busca de usuários", err);
        setSuggestions([]);
        setOpen(false);
      }
    }, 300);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Para: busque por nome/NUSP ou digite um email"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {suggestions.map((u) => (
            <button
              key={u.NUSP}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              onMouseDown={() => {
                onChange(u.email ?? "");
                setOpen(false);
              }}
            >
              <span className="font-medium">{u.name}</span>{" "}
              <span className="text-gray-500">
                — {u.NUSP} — {u.email}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
