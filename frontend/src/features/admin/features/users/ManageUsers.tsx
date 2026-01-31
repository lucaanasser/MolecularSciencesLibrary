import { useState } from "react";
import ActionGrid from "@/features/admin/components/ActionGrid";
import AddUserForm from "@/features/admin/features/users/components/AddUserForm";
import UserList from "@/features/admin/features/users/components/UserList";
import RemoveUserForm from "@/features/admin/features/users/components/RemoveUserForm";
import { useToast } from "@/components/ui/use-toast";

const ManageUsers = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"add" | "remove" | "list" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const handleSuccess = () => {
    setSelectedTab(null);
    toast({
      title: "Sucesso!",
      description: successMsg,
  });};

  return (
    <>
      {!selectedTab && (
        <>
          <h3>Gerenciamento de Usuários</h3>
          <p>Cadastre, busque ou remova usuários do sistema.</p>
          <ActionGrid
            actions={[
              { label: "Adicionar usuário", onClick: () => setSelectedTab("add"), color: "bg-cm-green", disabled: isLoading },
              { label: "Remover usuário", onClick: () => setSelectedTab("remove"), color: "bg-cm-red", disabled: isLoading },
              { label: "Ver lista de usuários", onClick: () => setSelectedTab("list"), color: "bg-academic-blue", disabled: isLoading },
            ]}
            columns={3}
          />
        </>
      )}

      {selectedTab === "add" && (
        <>
          <p>Preencha os dados do usuário a ser adicionado:</p>
          <AddUserForm
            onSuccess={() => {
              setSelectedTab(null);
              setSuccessMsg("Usuário adicionado com sucesso!");
            }}
            onError={(err) => {
              setSuccessMsg(`Erro: ${err.message}`);
            }}
            onBack={() => setSelectedTab(null)}
          />
        </>
      )}

      {selectedTab === "list" && (
        <>
          <p>Esses são todos os usuários cadastrados no site:</p>
          <UserList onClose={() => setSelectedTab(null)} />
        </>
      )}

      {selectedTab === "remove" && (
        <>
          <p>Digite nome, email ou NUSP do usuário a ser removido:</p>
          <RemoveUserForm
            onSuccess={() => {
              setSelectedTab(null);
              setSuccessMsg("Usuário removido com sucesso!");
            }}
            onError={(err) => {
              setSuccessMsg(`Erro: ${err.message}`);
            }}
            onBack={() => setSelectedTab(null)}
          />
        </>
      )}

      {successMsg && handleSuccess()}
    </>
  );
};

export default ManageUsers;