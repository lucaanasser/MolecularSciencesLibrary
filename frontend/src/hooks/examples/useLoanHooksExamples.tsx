/**
 * EXEMPLO: Uso dos hooks de empréstimo e devolução
 * 
 * Este arquivo demonstra como usar os hooks reutilizáveis em diferentes contextos:
 * - Página Admin: pode criar empréstimos sem senha
 * - Página do Aluno: precisa autenticar com senha
 * - Devolução: disponível para ambos os contextos
 */

import { useState } from "react";
import { useLoanOperation } from "../useLoanOperation";
import { useReturnOperation } from "../useReturnOperation";
import { useLoanValidation } from "../useLoanValidation";

// ==========================================
// EXEMPLO 1: Página Admin - Empréstimo
// ==========================================
export function ExampleAdminLoan() {
  const { createLoanAdmin, loading, error, result } = useLoanOperation();
  const { findUserByNusp, validateBook } = useLoanValidation();
  const [nusp, setNusp] = useState("");
  const [bookId, setBookId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar usuário
    const user = await findUserByNusp(nusp);
    if (!user) {
      alert("NUSP não encontrado");
      return;
    }

    // Validar livro
    const book = await validateBook(bookId);
    if (!book) {
      alert("Livro não encontrado ou não disponível");
      return;
    }

    // Criar empréstimo (admin não precisa de senha)
    try {
      const loan = await createLoanAdmin({
        NUSP: nusp,
        book_id: Number(bookId),
      });
      alert(`Empréstimo criado! ID: ${loan.id || loan.loan_id}`);
    } catch (err) {
      alert("Erro ao criar empréstimo");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nusp}
        onChange={(e) => setNusp(e.target.value)}
        placeholder="NUSP"
      />
      <input
        value={bookId}
        onChange={(e) => setBookId(e.target.value)}
        placeholder="ID do Livro"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Processando..." : "Criar Empréstimo"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <p style={{ color: "green" }}>Sucesso! Empréstimo ID: {result.id}</p>}
    </form>
  );
}

// ==========================================
// EXEMPLO 2: Página do Aluno - Empréstimo
// ==========================================
export function ExampleStudentLoan() {
  const { createLoan, loading, error, result } = useLoanOperation();
  const { findUserByNusp, validatePassword, validateBook } = useLoanValidation();
  const [nusp, setNusp] = useState("");
  const [password, setPassword] = useState("");
  const [bookId, setBookId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar usuário
    const user = await findUserByNusp(nusp);
    if (!user) {
      alert("NUSP não encontrado");
      return;
    }

    // Validar senha
    const isPasswordValid = await validatePassword(nusp, password);
    if (!isPasswordValid) {
      alert("Senha incorreta");
      return;
    }

    // Validar livro
    const book = await validateBook(bookId);
    if (!book) {
      alert("Livro não encontrado ou não disponível");
      return;
    }

    // Criar empréstimo (aluno precisa de senha)
    try {
      const loan = await createLoan({
        NUSP: nusp,
        password: password,
        book_id: Number(bookId),
      });
      alert(`Empréstimo criado! ID: ${loan.id || loan.loan_id}`);
    } catch (err) {
      alert("Erro ao criar empréstimo");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nusp}
        onChange={(e) => setNusp(e.target.value)}
        placeholder="NUSP"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <input
        value={bookId}
        onChange={(e) => setBookId(e.target.value)}
        placeholder="ID do Livro"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Processando..." : "Criar Empréstimo"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <p style={{ color: "green" }}>Sucesso! Empréstimo ID: {result.id}</p>}
    </form>
  );
}

// ==========================================
// EXEMPLO 3: Devolução (Admin ou Aluno)
// ==========================================
export function ExampleReturn() {
  const { returnBook, loading, error, result } = useReturnOperation();
  const { validateBook } = useLoanValidation();
  const [bookId, setBookId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que o livro existe
    const book = await validateBook(bookId);
    if (!book) {
      alert("Livro não encontrado");
      return;
    }

    // Processar devolução
    try {
      const returnResult = await returnBook({
        book_id: Number(bookId),
      });
      alert(`Devolução processada! ${returnResult.message || "Sucesso"}`);
    } catch (err) {
      alert("Erro ao processar devolução");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={bookId}
        onChange={(e) => setBookId(e.target.value)}
        placeholder="ID do Livro"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Processando..." : "Processar Devolução"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <p style={{ color: "green" }}>Devolução concluída!</p>}
    </form>
  );
}

// ==========================================
// EXEMPLO 4: Uso combinado em um wizard
// ==========================================
export function ExampleWizard({ isAdmin = false }: { isAdmin?: boolean }) {
  const loanOps = useLoanOperation();
  const validation = useLoanValidation();
  const [step, setStep] = useState(1);
  const [nusp, setNusp] = useState("");
  const [password, setPassword] = useState("");
  const [bookId, setBookId] = useState("");

  const handleNext = async () => {
    if (step === 1) {
      // Validar NUSP
      const user = await validation.findUserByNusp(nusp);
      if (!user) {
        alert("NUSP não encontrado");
        return;
      }
      if (isAdmin) {
        setStep(3); // Admin pula a senha
      } else {
        setStep(2); // Aluno precisa de senha
      }
    } else if (step === 2) {
      // Validar senha (apenas para aluno)
      const isValid = await validation.validatePassword(nusp, password);
      if (!isValid) {
        alert("Senha incorreta");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Validar livro
      const book = await validation.validateBook(bookId);
      if (!book) {
        alert("Livro não encontrado ou não disponível");
        return;
      }
      // Criar empréstimo
      try {
        if (isAdmin) {
          await loanOps.createLoanAdmin({ NUSP: nusp, book_id: Number(bookId) });
        } else {
          await loanOps.createLoan({ NUSP: nusp, password, book_id: Number(bookId) });
        }
        alert("Empréstimo criado com sucesso!");
        setStep(1);
        setNusp("");
        setPassword("");
        setBookId("");
      } catch (err) {
        alert("Erro ao criar empréstimo");
      }
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h3>Step 1: NUSP</h3>
          <input value={nusp} onChange={(e) => setNusp(e.target.value)} placeholder="NUSP" />
        </div>
      )}
      {step === 2 && !isAdmin && (
        <div>
          <h3>Step 2: Senha</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
          />
        </div>
      )}
      {step === 3 && (
        <div>
          <h3>Step 3: Livro</h3>
          <input value={bookId} onChange={(e) => setBookId(e.target.value)} placeholder="ID do Livro" />
        </div>
      )}
      <button onClick={handleNext} disabled={loanOps.loading || validation.loading}>
        {step < 3 ? "Próximo" : "Confirmar"}
      </button>
      {step > 1 && <button onClick={() => setStep(step - 1)}>Voltar</button>}
    </div>
  );
}
