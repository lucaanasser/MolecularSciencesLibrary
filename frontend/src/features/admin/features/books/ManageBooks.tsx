import AdminTabRenderer, { AdminAction, TabComponent } from "@/features/admin/components/AdminTabRenderer";
import AddBookForm from "@/features/admin/features/books/features/AddBookWizard";
import RemoveBookForm from "@/features/admin/features/books/features/RemoveBookWizard";
import BooksList from "@/features/admin/features/books/features/BooksList";
import ImportBooksCSV from "@/features/admin/features/books/features/ImportBooksCSV";

const ManageBooks = () => {
  const actions: AdminAction[] = [
    { id: "add", label: "Adicionar livro", color: "bg-cm-green" },
    { id: "remove", label: "Remover livro", color: "bg-cm-red" },
    { id: "list", label: "Ver todo o acervo", color: "bg-cm-blue" },
    { id: "import", label: "Importar CSV", color: "bg-library-purple" },
  ];

  const tabComponents: TabComponent[] = [
    { id: "add", component: (props) => <AddBookForm onCancel={props.onBack} onSuccess={props.onSuccess} onError={props.onError} /> },
    { id: "remove", component: (props) => <RemoveBookForm onCancel={props.onBack} onSuccess={props.onSuccess} onError={props.onError} /> },
    { id: "import", component: (props) => <ImportBooksCSV onCancel={props.onBack} onSuccess={props.onSuccess} onError={props.onError} /> },
    { id: "list", component: (props) => <BooksList onClose={props.onBack} /> },
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
