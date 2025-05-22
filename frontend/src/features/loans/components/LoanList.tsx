import { useLoanList } from "../hooks/useLoanList";

export default function LoanList() {
  const { loans, loading, error } = useLoanList();

  if (loading) return <div>Carregando empréstimos...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Empréstimos Registrados</h3>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Livro</th>
            <th className="border px-2 py-1">Usuário</th>
            <th className="border px-2 py-1">Data Empréstimo</th>
            <th className="border px-2 py-1">Data Devolução</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.loan_id}>
              <td className="border px-2 py-1">{loan.loan_id}</td>
              <td className="border px-2 py-1">{loan.book_title || loan.book_id}</td>
              <td className="border px-2 py-1">{loan.user_name || loan.student_id}</td>
              <td className="border px-2 py-1">{loan.borrowed_at ? new Date(loan.borrowed_at).toLocaleDateString() : ""}</td>
              <td className="border px-2 py-1">{loan.returned_at ? new Date(loan.returned_at).toLocaleDateString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}