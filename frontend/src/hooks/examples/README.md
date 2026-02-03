# Hooks de Empréstimo e Devolução

Esta documentação explica como usar os hooks reutilizáveis para operações de empréstimo e devolução de livros.

## Hooks Disponíveis

### 1. `useLoanOperations`

Hook para criar empréstimos.

**Funções:**
- `createLoan(params)` - Cria empréstimo com autenticação (requer senha)
- `createLoanAdmin(params)` - Cria empréstimo no modo admin (sem senha)
- `reset()` - Limpa o estado do hook

**Estados:**
- `loading: boolean` - Indica se está processando
- `error: string | null` - Mensagem de erro
- `result: LoanResult | null` - Resultado do empréstimo

**Exemplo de uso:**
```typescript
import { useLoanOperations } from '@/hooks/useLoanOperations';

function MyComponent() {
  const { createLoan, loading, error, result } = useLoanOperations();

  const handleLoan = async () => {
    try {
      const loan = await createLoan({
        NUSP: "12345678",
        password: "senha123",
        book_id: 1
      });
      console.log("Empréstimo criado:", loan);
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  return (
    <button onClick={handleLoan} disabled={loading}>
      {loading ? "Processando..." : "Criar Empréstimo"}
    </button>
  );
}
```

### 2. `useReturnOperations`

Hook para processar devoluções.

**Funções:**
- `returnBook(params)` - Processa devolução de livro
- `reset()` - Limpa o estado do hook

**Estados:**
- `loading: boolean` - Indica se está processando
- `error: string | null` - Mensagem de erro
- `result: ReturnResult | null` - Resultado da devolução

**Exemplo de uso:**
```typescript
import { useReturnOperations } from '@/hooks/useReturnOperations';

function MyComponent() {
  const { returnBook, loading, error, result } = useReturnOperations();

  const handleReturn = async (bookId: number) => {
    try {
      const result = await returnBook({ book_id: bookId });
      console.log("Devolução processada:", result);
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  return (
    <button onClick={() => handleReturn(1)} disabled={loading}>
      {loading ? "Processando..." : "Devolver Livro"}
    </button>
  );
}
```

### 3. `useLoanValidation`

Hook para validações relacionadas a empréstimos.

**Funções:**
- `findUserByNusp(nusp)` - Busca usuário por NUSP
- `validatePassword(nusp, password)` - Valida senha do usuário
- `validateBook(bookId)` - Valida se livro está disponível
- `reset()` - Limpa o estado do hook

**Estados:**
- `loading: boolean` - Indica se está processando
- `error: string | null` - Mensagem de erro

**Exemplo de uso:**
```typescript
import { useLoanValidation } from '@/hooks/useLoanValidation';

function MyComponent() {
  const { findUserByNusp, validatePassword, validateBook, loading } = useLoanValidation();

  const handleValidation = async () => {
    // Validar usuário
    const user = await findUserByNusp("12345678");
    if (!user) {
      alert("Usuário não encontrado");
      return;
    }

    // Validar senha
    const isValidPassword = await validatePassword("12345678", "senha123");
    if (!isValidPassword) {
      alert("Senha incorreta");
      return;
    }

    // Validar livro
    const book = await validateBook(1);
    if (!book) {
      alert("Livro não disponível");
      return;
    }

    console.log("Validações OK!");
  };

  return (
    <button onClick={handleValidation} disabled={loading}>
      Validar
    </button>
  );
}
```

## Fluxos de Uso

### Fluxo Admin - Criar Empréstimo

```typescript
import { useLoanOperations, useLoanValidation } from '@/hooks';

function AdminLoanPage() {
  const { createLoanAdmin, loading, error } = useLoanOperations();
  const { findUserByNusp, validateBook } = useLoanValidation();

  const handleCreateLoan = async (nusp: string, bookId: number) => {
    // 1. Validar usuário
    const user = await findUserByNusp(nusp);
    if (!user) {
      alert("NUSP não encontrado");
      return;
    }

    // 2. Validar livro
    const book = await validateBook(bookId);
    if (!book) {
      alert("Livro não disponível");
      return;
    }

    // 3. Criar empréstimo (sem senha)
    try {
      await createLoanAdmin({ NUSP: nusp, book_id: bookId });
      alert("Empréstimo criado com sucesso!");
    } catch (err) {
      alert("Erro ao criar empréstimo");
    }
  };
}
```

### Fluxo Aluno - Criar Empréstimo

```typescript
import { useLoanOperations, useLoanValidation } from '@/hooks';

function StudentLoanPage() {
  const { createLoan, loading, error } = useLoanOperations();
  const { findUserByNusp, validatePassword, validateBook } = useLoanValidation();

  const handleCreateLoan = async (nusp: string, password: string, bookId: number) => {
    // 1. Validar usuário
    const user = await findUserByNusp(nusp);
    if (!user) {
      alert("NUSP não encontrado");
      return;
    }

    // 2. Validar senha
    const isValidPassword = await validatePassword(nusp, password);
    if (!isValidPassword) {
      alert("Senha incorreta");
      return;
    }

    // 3. Validar livro
    const book = await validateBook(bookId);
    if (!book) {
      alert("Livro não disponível");
      return;
    }

    // 4. Criar empréstimo (com senha)
    try {
      await createLoan({ NUSP: nusp, password, book_id: bookId });
      alert("Empréstimo criado com sucesso!");
    } catch (err) {
      alert("Erro ao criar empréstimo");
    }
  };
}
```

### Fluxo de Devolução (Admin ou Aluno)

```typescript
import { useReturnOperations, useLoanValidation } from '@/hooks';

function ReturnPage() {
  const { returnBook, loading, error } = useReturnOperations();
  const { validateBook } = useLoanValidation();

  const handleReturn = async (bookId: number) => {
    // 1. Validar que o livro existe
    const book = await validateBook(bookId);
    if (!book) {
      alert("Livro não encontrado");
      return;
    }

    // 2. Processar devolução
    try {
      await returnBook({ book_id: bookId });
      alert("Devolução processada com sucesso!");
    } catch (err) {
      alert("Erro ao processar devolução");
    }
  };
}
```

## Tipos

### LoanResult
```typescript
interface LoanResult {
  id?: number;
  loan_id?: number;
  NUSP: string;
  book_id: number;
  loan_date?: string;
  due_date?: string;
  return_date?: string | null;
  status?: string;
}
```

### ReturnResult
```typescript
interface ReturnResult {
  message?: string;
  loan_id?: number;
  book_id?: number;
  return_date?: string;
}
```

### User
```typescript
interface User {
  NUSP: string;
  name?: string;
  email?: string;
  profile_picture?: string;
}
```

### Book
```typescript
interface Book {
  id: number;
  title?: string;
  author?: string;
  available?: boolean;
}
```

## Logs

Todos os hooks seguem o padrão de logs:
- 🔵 Início de operação
- 🟢 Sucesso
- 🟡 Aviso/Fluxo alternativo
- 🔴 Erro

## Arquivos Criados

- `/frontend/src/hooks/useLoanOperations.ts` - Hook para criar empréstimos
- `/frontend/src/hooks/useReturnOperations.ts` - Hook para devoluções
- `/frontend/src/hooks/useLoanValidation.ts` - Hook para validações
- `/frontend/src/hooks/examples/useLoanHooksExamples.tsx` - Exemplos de uso
