import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import { BorrowBook, ReturnBook, RegisterInternalUse, ListActiveLoans } from "@/features/admin/features/loans";
import { logger } from "@/utils/logger";

const ManageLoans = () => {
  logger.log("🔵 [AdminPage/ManageLoans] Renderizando gerenciamento de empréstimos");

  return (
    <AdminTabRenderer
      title="Gerenciamento de Empréstimos"
      description="Gerencie empréstimos e visualize todos os empréstimos ativos."
      actions={[
        { id: "loan", label: "Registrar empréstimo", color: "bg-cm-green" },
        { id: "return", label: "Registrar devolução", color: "bg-cm-red" },
        { id: "internal", label: "Registrar Uso Interno", color: "bg-cm-orange" },
        { id: "list", label: "Ver Empréstimos Ativos", color: "bg-cm-blue" },
      ]}
      tabComponents={[
        { id: "loan", component: BorrowBook },
        { id: "return", component: ReturnBook },
        { id: "internal", component: RegisterInternalUse },
        { id: "list", component: ListActiveLoans },
      ]}
      columns={4}
    />
  );
};

export default ManageLoans;
