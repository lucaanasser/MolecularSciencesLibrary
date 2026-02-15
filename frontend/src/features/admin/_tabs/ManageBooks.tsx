import AdminTabRenderer, { AdminAction, TabComponent } from "@/features/admin/components/AdminTabRenderer";
import AddBookForm from "@/features/admin/features/books/AddBookForm";
import RemoveBookForm from "@/features/admin/features/books/RemoveBookForm";
import ListBooks from "@/features/admin/features/books/ListBooks";
import ImportBooks from "@/features/admin/features/books/ImportBooks";

const ManageBooks = () => {
  const actions: AdminAction[] = [
    { id: "add", label: "Adicionar livro", color: "bg-cm-green" },
    { id: "remove", label: "Remover livro", color: "bg-cm-red" },
    { id: "list", label: "Ver todo o acervo", color: "bg-cm-blue" },
    { id: "import", label: "Importar CSV", color: "bg-library-purple" },
  ];

  const tabComponents: TabComponent[] = [
    { id: "add", component: (props) => <AddBookForm {...props} /> },
    { id: "remove", component: (props) => <RemoveBookForm {...props} /> },
    { id: "import", component: (props) => <ImportBooks {...props} /> },
    { id: "list", component: (props) => <ListBooks onBack={props.onBack} /> },
  ];

  return (
    <AdminTabRenderer
      title="Gerenciamento de Livros"
      description="Adicione, remova ou veja todos os livros no acervo. Para adicionar vários livros de uma vez (batch import), escolha a opção 'Importar CSV'."
      actions={actions}
      tabComponents={tabComponents}
      columns={4}
    />
  );
};

export default ManageBooks;