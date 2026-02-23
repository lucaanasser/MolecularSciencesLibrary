import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import { AddToReserve, RemoveFromReserve, ListReservedBooks, ClearReserve } from "@/features/admin/features/reserve";

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
        { id: "add", component: AddToReserve },
        { id: "remove", component: RemoveFromReserve },
        { id: "clear", component: ClearReserve },
        { id: "list", component: ListReservedBooks },
      ]}
      columns={4}
    />
  );
};

export default ManageReserve;
