#!/usr/bin/env node
/**
 * Script diário para:
 * 1. Identificar empréstimos em atraso
 * 2. Criar notificações (primeiro aviso e lembretes periódicos)
 * 3. Enviar email consolidado de atraso por usuário somente quando há novo aviso ou lembrete devido
 *
 * É executado pelo serviço "cron" no docker-compose.
 *
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Fluxo alternativo 
 * 🔴 Erro
 */

require('dotenv').config();

const LoansService = require('../src/services/LoansService');
const NotificationsService = require('../src/services/NotificationsService');
const EmailService = require('../src/services/EmailService');
const RulesService = require('../src/services/RulesService');

async function main() {
  console.log('🔵 [checkOverdues] Iniciando verificação de empréstimos em atraso...');
  try {
    // NOVO: processa extensões pendentes antes de qualquer outra coisa
    try {
      const applied = await LoansService.processPendingExtensions();
      if (applied > 0) {
        console.log(`🟢 [checkOverdues] Extensões pendentes aplicadas automaticamente: ${applied}`);
      } else {
        console.log('🟡 [checkOverdues] Nenhuma extensão pendente elegível para aplicar no momento.');
      }
    } catch (e) {
      console.error('🔴 [checkOverdues] Falha ao processar extensões pendentes:', e.message);
    }

    // Testa conexão SMTP apenas uma vez (log informativo, não bloqueante)
    EmailService.testConnection().catch(()=>{});

    const rules = await RulesService.getRules().catch(() => ({ overdue_reminder_days: 3 }));
    const reminderDays = rules.overdue_reminder_days || 3;

    // Lista empréstimos ativos e marca quais estão atrasados
    const activeLoans = await LoansService.listActiveLoansWithOverdue();
    const overdueLoans = activeLoans.filter(l => l.is_overdue);

    if (overdueLoans.length === 0) {
      console.log('🟡 [checkOverdues] Nenhum empréstimo em atraso no momento.');
      return process.exit(0);
    }

    console.log(`🔵 [checkOverdues] Empréstimos em atraso encontrados: ${overdueLoans.length}`);

    // Agrupa empréstimos por usuário
    const loansByUser = new Map();
    for (const loan of overdueLoans) {
      if (!loansByUser.has(loan.student_id)) loansByUser.set(loan.student_id, []);
      loansByUser.get(loan.student_id).push(loan);
    }

    let totalNotifications = 0;
    let totalEmails = 0;

    // Para cada usuário, decide se envia email (novo atraso ou lembrete devido)
    for (const [userId, loans] of loansByUser.entries()) {
      let shouldEmail = false;

      for (const loan of loans) {
        // Primeiro aviso (se ainda não existe)
        const created = await NotificationsService.createOverdueNotificationIfNotExists(loan);
        if (created) {
          totalNotifications++; shouldEmail = true; continue; // já garante email
        }
        // Lembrete periódico
        const reminder = await NotificationsService.createOverdueReminderIfDue(loan, reminderDays);
        if (reminder) { totalNotifications++; shouldEmail = true; }
      }

      if (shouldEmail) {
        try {
          await EmailService.sendOverdueEmail({
            user_id: userId,
            books: loans.map(l => ({
              book_id: l.book_id,
              book_title: l.book_title,
              due_date: l.due_date
            }))
          });
          totalEmails++;
        } catch (err) {
          console.error(`🔴 [checkOverdues] Falha ao enviar email de atraso para user ${userId}:`, err.message);
        }
      } else {
        console.log(`🟡 [checkOverdues] Sem novo aviso/lembrete para user ${userId} (email não enviado).`);
      }
    }

    console.log(`🟢 [checkOverdues] Concluído. Notificações criadas: ${totalNotifications}. Emails enviados: ${totalEmails}.`);
    process.exit(0);
  } catch (error) {
    console.error('🔴 [checkOverdues] Erro inesperado:', error.message);
    process.exit(1);
  }
}

main();
