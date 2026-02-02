import { useState } from "react";
import ActionGrid from "@/features/admin/components/ActionGrid";
import AddUserForm from "@/features/admin/features/users/features/AddUserForm";
import UserList from "@/features/admin/features/users/features/UserList";
import RemoveUserForm from "@/features/admin/features/users/features/RemoveUserForm";
import ImportUsers from "@/features/admin/features/users/features/ImportUsers";
import { useToast } from "@/components/ui/use-toast";

const ManageUsers = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"add" | "remove" | "list" | "import" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSuccess = () => {
    setSelectedTab(null);
    toast({
      title: "Sucesso!",
      description: successMsg,
    });
  };

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
              { label: "Importar usuários CSV", onClick: () => setSelectedTab("import"), color: "bg-library-purple", disabled: isLoading },
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

      {selectedTab === "import" && (
        <>
          <p>Importe usuários em lote através de um arquivo CSV:</p>
          <ImportUsers
            onSuccess={(results) => {
              setSelectedTab(null);
              const msg = `Importação concluída: ${results.success} usuário(s) importado(s) com sucesso${results.failed > 0 ? `, ${results.failed} falharam` : ''}`;
              setSuccessMsg(msg);
              toast({
                title: "Importação concluída!",
                description: msg,
              });
            }}
            onError={(err) => {
              setSuccessMsg(`Erro na importação: ${err.message}`);
              toast({
                title: "Erro",
                description: `Erro na importação: ${err.message}`,
                variant: "destructive",
              });
            }}
            onCancel={() => setSelectedTab(null)}
            onBack={() => setSelectedTab(null)}
          />
        </>
      )}

      {successMsg && handleSuccess()}
    </>
  );
};

export default ManageUsers;