-- Caixa de entrada de contato@bibliotecamoleculares.com.
-- Recebidos chegam via Cloudflare Email Routing → handler email do Worker
-- (worker/src/services/emailInbox.ts); enviados saem pelo painel admin via Resend.
-- Uma tabela unica com direction faz a thread sair de uma query so.
CREATE TABLE email_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT NOT NULL, -- message_id da 1a mensagem da conversa; herdado via In-Reply-To
  direction TEXT NOT NULL CHECK(direction IN ('in', 'out')), -- in recebido, out enviado pelo painel
  message_id TEXT, -- header Message-ID (com <>)
  in_reply_to TEXT, -- header In-Reply-To da mensagem, se houver
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_address TEXT NOT NULL,
  subject TEXT,
  body_text TEXT, -- truncado em ~100KB na gravacao (limite pratico do D1)
  body_html TEXT, -- idem
  preview TEXT, -- ~200 chars do texto; usado na lista e na notificacao do Gmail
  auth_verdict TEXT NOT NULL DEFAULT 'clean' CHECK(auth_verdict IN ('clean', 'suspect')), -- SPF/DKIM/DMARC do Authentication-Results
  has_attachments INTEGER NOT NULL DEFAULT 0, -- 0 nao, 1 sim (bytes nao sao guardados na v1)
  attachment_names TEXT, -- JSON array com nomes dos anexos, apenas informativo
  status TEXT NOT NULL DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'archived')), -- so relevante em direction='in'
  sent_by_user_id INTEGER, -- admin que enviou (direction='out')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(sent_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_email_messages_thread ON email_messages(thread_id, created_at);
CREATE INDEX idx_email_messages_status ON email_messages(status, created_at DESC);
CREATE INDEX idx_email_messages_message_id ON email_messages(message_id);
