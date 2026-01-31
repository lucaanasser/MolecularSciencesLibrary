import { useState } from "react";
import ActionGrid from "@/features/admin/components/ActionGrid";
import AddReserve from "./features/AddReserve";
import RemoveReserve from "./features/RemoveReserve";
import ListReserve from "./features/ListReserve";
import ClearReserve from "./features/ClearReserve";

const ManageReserve = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  // Estados e handlers agora estão nos componentes de tab
  console.log("🔵 [AdminPage/ManageReserve] Renderizando gerenciamento de reserva");

  return (
    <>
      {!selectedTab && (
        <>
          <h3>Gerenciamento de Reserva Didática</h3>
          <p>Gerencie os livros reservados para uso exclusivo na biblioteca durante o semestre.</p>
      
          <ActionGrid
            columns={4}
            actions={[
              {
                label: "Adicionar à reserva",
                onClick: () => setSelectedTab('add'),
                color: "bg-cm-green",
              },
              {
                label: "Remover da reserva",
                onClick: () => setSelectedTab('remove'),
                color: "bg-cm-red",
              },
              {
                label: "Limpar reserva",
                onClick: () => setSelectedTab('clear'),
                color: "bg-library-purple",
              },
              {
                label: "Ver livros reservados",
                onClick: () => setSelectedTab('list'),
                color: "bg-academic-blue",
              },
            ]}
          />
        </>
      )}

      {selectedTab === 'add' && (
        <AddReserve onBack={() => setSelectedTab(null)} />
      )}

      {selectedTab === 'remove' && (
        <RemoveReserve onBack={() => setSelectedTab(null)} />
      )}

      {selectedTab === 'clear' && (
        <ClearReserve onBack={() => setSelectedTab(null)} />
      )}

      {selectedTab === 'list' && (
        <ListReserve onBack={() => setSelectedTab(null)} />
      )}
    </>
  );
};

export default ManageReserve;
