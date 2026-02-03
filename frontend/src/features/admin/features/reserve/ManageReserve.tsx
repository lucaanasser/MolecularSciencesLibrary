import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import AddReserveForm from "./AddReserveForm";
import RemoveReserveForm from "./RemoveReserveForm";
import ListReserve from "./ListReserve";
import ClearReserve from "./ClearReserve";

const ManageReserve = () => {
  console.log("🔵 [AdminPage/ManageReserve] Renderizando gerenciamento de reserva");

  return (
    <AdminTabRenderer
      title="Gerenciamento de Reserva Didática"
      description="Gerencie os livros reservados para uso exclusivo na biblioteca durante o semestre."
      actions={[
        { id: "add", label: "Adicionar à reserva", color: "bg-cm-green" },
        { id: "remove", label: "Remover da reserva", color: "bg-cm-red" },
        { id: "clear", label: "Limpar reserva", color: "bg-library-purple" },
        { id: "list", label: "Ver livros reservados", color: "bg-academic-blue" },
      ]}
      tabComponents={[
        { id: "add", component: AddReserveForm },
        { id: "remove", component: RemoveReserveForm },
        { id: "clear", component: ClearReserve },
        { id: "list", component: ListReserve },
      ]}
      columns={4}
    />
  );
};

export default ManageReserve;
