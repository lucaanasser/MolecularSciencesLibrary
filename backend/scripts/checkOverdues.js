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
    // Notificações para empréstimos que vencem em 3 dias
    const now = new Date();
    const soonDueLoans = loans.filter(loan => {
      if (loan.returned_at) return false;
      const dueDate = new Date(loan.due_date);
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return diffDays === 3;
    });
    console.log(`🟢 [checkOverdues] Empréstimos vencendo em 3 dias: ${soonDueLoans.length}`);
    for (const loan of soonDueLoans) {
      await EmailService.sendNotificationEmail({
        user_id: loan.student_id,
        type: 'lembrete_devolucao',
        subject: 'Lembrete: Faltam 3 dias para devolver o livro',
        message: `O prazo para devolução do livro "${loan.book_title || loan.book_id}" termina em 3 dias. Por favor, organize-se para devolver no prazo!`,
      });
    }
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
