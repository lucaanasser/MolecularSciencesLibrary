/**
 * Tipos da caixa de contato@ no painel admin.
 * Espelham as respostas de /api/email (worker/src/routes/email.ts / services/emailThreads.ts).
 */

export type EmailFolder = "inbox" | "quarantine" | "archived" | "sent";

export interface EmailThreadSummary {
  thread_id: string;
  last_at: string;
  message_count: number;
  unread_count: number;
  subject: string | null;
  from_address: string | null;
  from_name: string | null;
  direction: "in" | "out" | null;
  to_address: string | null;
  preview: string | null;
  has_attachments: number;
  auth_verdict: "clean" | "suspect";
}

export interface EmailMessage {
  id: number;
  thread_id: string;
  direction: "in" | "out";
  from_address: string;
  from_name: string | null;
  to_address: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  preview: string | null;
  auth_verdict: "clean" | "suspect";
  has_attachments: number;
  attachment_names: string | null; // JSON array com nomes; bytes nao sao guardados na v1
  status: "unread" | "read" | "archived";
  created_at: string;
}

export interface EmailFolderCounts {
  inbox: number;
  quarantine: number;
  archived: number;
  sent: number;
  unread: number;
}

export interface EmailThreadsResponse {
  threads: EmailThreadSummary[];
  counts: EmailFolderCounts;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
