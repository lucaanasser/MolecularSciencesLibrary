import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import ActiveLoansList from "@/features/admin/features/loans/ActiveLoansList";
import InternalUseRegister from "@/features/admin/features/loans/InternalUseRegister";
import LoanForm from "@/features/admin/features/loans/LoanForm";
import ReturnForm from "@/features/admin/features/loans/ReturnForm";

const ManageLoans = () => {
  console.log("🔵 [AdminPage/ManageLoans] Renderizando gerenciamento de empréstimos");

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
        { id: "loan", component: LoanForm },
        { id: "return", component: ReturnForm },
        { id: "internal", component: InternalUseRegister },
        { id: "list", component: ActiveLoansList },
      ]}
      columns={4}
    />
  );
};

export default ManageLoans;
