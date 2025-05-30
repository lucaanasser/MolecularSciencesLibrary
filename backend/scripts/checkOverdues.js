// Script para verificar empréstimos atrasados e notificar usuários
const LoansService = require('../src/services/LoansService');
const NotificationsService = require('../src/services/NotificationsService');
const RulesService = require('../src/services/RulesService');
const EmailService = require('../src/services/EmailService');

async function main() {
  console.log('🔵 [checkOverdues] Iniciando verificação de atrasos...');
  try {
    const rules = await RulesService.getRules();
    const reminderDays = rules.overdue_reminder_days || 3;
    const loans = await LoansService.listActiveLoansWithOverdue();
    const overdueLoans = loans.filter(loan => loan.is_overdue);
    console.log(`🟢 [checkOverdues] Empréstimos atrasados encontrados: ${overdueLoans.length}`);
    for (const loan of overdueLoans) {
      // Cria notificação interna de atraso
      const notificationId = await NotificationsService.createOverdueNotificationIfNotExists(loan);
      // Envia email de atraso se a notificação foi criada agora (ou seja, não existia antes)
      if (notificationId) {
        await EmailService.sendOverdueEmail({ user_id: loan.student_id, books: [loan] });
      }
      // Lembrete periódico
      const reminderId = await NotificationsService.createOverdueReminderIfDue(loan, reminderDays);
      // Envia email de lembrete se o lembrete foi criado agora (ou seja, não existia ou já passou o período)
      if (reminderId) {
        await EmailService.sendOverdueReminderEmail({ user_id: loan.student_id, books: [loan] });
      }
    }
    console.log('🟢 [checkOverdues] Verificação concluída.');
  } catch (err) {
    console.error('🔴 [checkOverdues] Erro ao verificar atrasos:', err);
    process.exit(1);
  }
}

main();
