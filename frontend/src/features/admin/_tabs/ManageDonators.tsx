import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import AddDonatorForm from "@/features/admin/features/donators/AddDonatorForm";
import DonatorsList from "@/features/admin/features/donators/DonatorsList";
import ImportDonators from "@/features/admin/features/donators/ImportDonators";

const ManageDonators = () => {

  return (
    <AdminTabRenderer
      title="Gerenciamento de Doadores"
      description="Cadastre novos doadores ou visualize doadores já cadastrados no sistema. Para importar uma lista de doadores (batch import), utilize a opção 'Importar CSV'."
      actions={[
        { id: "add", label: "Adicionar doador", color: "bg-cm-green" },
        { id: "list", label: "Ver lista de doadores", color: "bg-cm-blue" },
        { id: "import", label: "Importar CSV", color: "bg-library-purple" },
      ]}
      tabComponents={[
        { id: "add", component: AddDonatorForm },
        { id: "list", component: DonatorsList },
        { id: "import", component: ImportDonators },
      ]}
      columns={3}
    />
  );
};

export default ManageDonators;
