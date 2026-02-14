import ProAlunoPageRefactored from "../../features/admin/features/proaluno/ProAlunoPageRefactored";
import AddBookForm from "@/features/admin/features/books/AddBookForm";

export default function TestPage() {

  return (
    <AddBookForm
      onSuccess={(message) => alert(`Sucesso: ${message}`)}
      onError={(message) => alert(`Erro: ${message}`)}
      onBack={() => alert("Ação cancelada")}
    /> 
  );
}