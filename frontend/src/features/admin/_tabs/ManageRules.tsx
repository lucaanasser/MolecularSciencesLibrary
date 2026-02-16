import AdminTabRenderer, { AdminTabRendererProps, AdminAction, TabComponent, TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import LoanRulesView from "@/features/admin/features/rules/LoanRulesView";
import LoanRulesForm from "@/features/admin/features/rules/LoanRulesEdit";

const actions: AdminAction[] = [
  { id: "view", label: "Ver regras", color: "bg-cm-blue" },
  { id: "edit", label: "Editar regras", color: "bg-cm-green" },
];

const tabComponents: TabComponent[] = [
  {
    id: "view",
    component: (props: TabComponentProps) => (
      <LoanRulesView
        {...props}
        // Chama a aba de edição ao clicar em editar
        onEdit={() => props.onTabChange?.("edit")}      
        />
    ),
  },
  {
    id: "edit",
    component: (props: TabComponentProps) => (
      <LoanRulesForm
        {...props}
      />
    ),
  },
];

const ManageRules = () => (
  <AdminTabRenderer
    title="Configurações de Regras de Empréstimo"
    description="Visualize ou edite as regras de empréstimo da biblioteca."
    actions={actions}
    tabComponents={tabComponents}
    columns={2}
  />
);

export default ManageRules;