
import AdminTabRenderer, { AdminAction, TabComponent } from "@/features/admin/components/AdminTabRenderer";
import { LoansReport, UsersReport, BooksReport, DonatorsReport, CompleteReport } from '@/features/admin/features/reports';

const Reports = () => {
  const actions: AdminAction[] = [
    { id: "books", label: "Acervo", color: "bg-cm-green" },
    { id: "loans", label: "Empréstimos", color: "bg-cm-blue" },
    { id: "users", label: "Usuários", color: "bg-cm-red" },
    { id: "donators", label: "Doadores", color: "bg-cm-orange" },
    { id: "complete", label: "Relatório Completo", color: "bg-library-purple" },
  ];

  const tabComponents: TabComponent[] = [
    { id: "books", component: (props) => <BooksReport {...props} /> },
    { id: "loans", component: (props) => <LoansReport {...props} /> },
    { id: "users", component: (props) => <UsersReport {...props} /> },
    { id: "donators", component: () => <DonatorsReport /> },
    { id: "complete", component: () => <CompleteReport /> },
  ];

  return (
    <AdminTabRenderer
      title="Relatórios"
      description="Visualize estatísticas e relatórios sobre o uso da biblioteca."
      actions={actions}
      tabComponents={tabComponents}
      columns={3}
    />
  );
};

export default Reports;
