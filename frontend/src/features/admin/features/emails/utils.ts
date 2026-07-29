/**
 * Helpers de apresentacao da caixa de contato@ (datas, nomes, anexos).
 * Usados em: EmailList, EmailThread.
 */
import type { EmailMessage, EmailThreadSummary } from "./types/email";

/* Converte o timestamp UTC do D1 ("YYYY-MM-DD HH:MM:SS") em Date local. */
export function parseDbDate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

/* Data curta estilo Gmail: hora se for hoje, senao dd/mm/aaaa. */
export function formatEmailDate(value: string): string {
  const date = parseDbDate(value);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  return sameDay
    ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("pt-BR");
}

/* Nome de exibicao do interlocutor: na pasta Enviados mostra o destinatario. */
export function displayName(t: EmailThreadSummary): string {
  if (t.direction === "out") return `Para: ${t.to_address ?? ""}`;
  return t.from_name || t.from_address || "(desconhecido)";
}

/* Nomes dos anexos (JSON gravado pelo worker); bytes nao sao armazenados na v1. */
export function attachmentNames(m: EmailMessage): string[] {
  if (!m.attachment_names) return [];
  try {
    const parsed = JSON.parse(m.attachment_names);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "string") : [];
  } catch {
    return [];
  }
}

/* Corpo para leitura: texto plano; se so houver HTML (email externo), remove as tags.
 * HTML cru de terceiros nunca e injetado no DOM (evita XSS sem depender de sanitizador). */
export function messageBody(m: EmailMessage): string {
  if (m.body_text && m.body_text.trim()) return m.body_text;
  if (m.body_html) return m.body_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return "";
}
