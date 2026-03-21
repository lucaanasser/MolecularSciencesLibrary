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

const LoansService = require('../../src/services/library/loans/LoansService');
const NotificationsService = require('../../src/services/utilities/NotificationsService');
const EmailService = require('../../src/services/utilities/EmailService');
const RulesService = require('../../src/services/utilities/RulesService');

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

    // Lista todos os empréstimos ativos
    const activeLoans = await LoansService.listActiveLoansWithOverdue();
    const now = new Date();
    let totalDueSoonEmails = 0;
    let totalOverdueEmails = 0;
    let totalNotifications = 0;

    // Verifica cada empréstimo ativo
    for (const loan of activeLoans) {
      if (loan.returned_at) continue;
      const dueDate = new Date(loan.due_date);
      const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      // Se estiver atrasado, mantém lógica de atraso
      if (loan.is_overdue) {
        // Notificações de atraso existentes
        const created = await NotificationsService.createOverdueNotificationIfNotExists(loan);
        if (created) totalNotifications++;
        const reminder = await NotificationsService.createOverdueReminderIfDue(loan, reminderDays);
        if (reminder) totalNotifications++;
        try {
          await EmailService.sendOverdueEmail({
            user_id: loan.student_id,
            books: [{
              book_id: loan.book_id,
              book_title: loan.book_title,
              due_date: loan.due_date
            }]
          });
          totalOverdueEmails++;
        } catch (err) {
          console.error(`🔴 [checkOverdues] Falha ao enviar email de atraso para user ${loan.student_id}:`, err.message);
        }
      } else if (daysLeft === 3 || daysLeft === 1) {
        // Envia email de devolução próxima
        try {
          await EmailService.sendDueSoonEmail({
            user_id: loan.student_id,
            book_title: loan.book_title,
            due_date: loan.due_date,
            days_left: daysLeft
          });
          totalDueSoonEmails++;
        } catch (err) {
          console.error(`� [checkOverdues] Falha ao enviar email de devolução próxima para user ${loan.student_id}:`, err.message);
        }
      }
    }

    console.log(`🟢 [checkOverdues] Concluído. Emails de devolução próxima enviados: ${totalDueSoonEmails}. Emails de atraso enviados: ${totalOverdueEmails}. Notificações criadas: ${totalNotifications}.`);
    process.exit(0);
  } catch (error) {
    console.error('🔴 [checkOverdues] Erro inesperado:', error.message);
    process.exit(1);
  }
}

main();
