const fs = require('fs');
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

const config = {
  imap: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    authTimeout: 10000,
    tlsOptions: {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined // Bypass hostname verification for Gmail
    }
  },
};

async function fetchInbox(limit = 20) {
  const connection = await imaps.connect(config);
  await connection.openBox('INBOX');
  const searchCriteria = ['ALL'];
  const fetchOptions = {
    bodies: ['HEADER', 'TEXT'],
    markSeen: false,
    struct: true,
  };
  const messages = await connection.search(searchCriteria, fetchOptions);
  const emails = await Promise.all(
    messages.slice(-limit).reverse().map(async (item) => {
      const all = item.parts.find((part) => part.which === 'HEADER');
      const id = item.attributes.uid;
      const subject = all && all.body.subject ? all.body.subject[0] : '';
      const from = all && all.body.from ? all.body.from[0] : '';
      const date = all && all.body.date ? all.body.date[0] : '';
      // Parse body
      let body = '';
      try {
        const raw = item.parts.find((part) => part.which === 'TEXT');
        if (raw && raw.body) {
          const parsed = await simpleParser(raw.body);
          body = parsed.text || '';
        }
      } catch (e) {}
      return { id, subject, from, date, body };
    })
  );
  await connection.end();
  return emails;
}

async function deleteEmail(emailId) {
  const connection = await imaps.connect(config);
  await connection.openBox('INBOX');
  
  try {
    // Marca o email para deleção
    await connection.addFlags(emailId, ['\\Deleted']);
    
    // Expunge usando o método correto do imap-simple
    await new Promise((resolve, reject) => {
      connection.imap.expunge((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log(`🟢 [InboxService] Email ${emailId} deletado com sucesso`);
    return { success: true };
  } catch (error) {
    console.error(`🔴 [InboxService] Erro ao deletar email ${emailId}:`, error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { fetchInbox, deleteEmail };
