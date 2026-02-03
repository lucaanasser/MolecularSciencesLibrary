import { useState } from "react";

/**
 * Hook reutilizável para validações relacionadas a empréstimos.
 * Centraliza as validações de usuário, senha e livros que são comuns
 * entre as páginas admin e do aluno.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

export interface User {
  NUSP: string;
  name?: string;
  email?: string;
  profile_picture?: string;
}

export interface Book {
  id: number;
  title?: string;
  author?: string;
  available?: boolean;
}

export function useLoanValidation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca um usuário pelo NUSP
   */
  const findUserByNusp = async (nusp: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔵 [useLoanValidation] Buscando usuário por NUSP:", nusp);
      
      const res = await fetch(`/api/users`);
      if (!res.ok) {
        console.error("🔴 [useLoanValidation] Erro ao buscar usuário");
        return null;
      }

      const usuarios = await res.json();
      const usuario = usuarios.find((u: any) => String(u.NUSP) === String(nusp));
      
      if (usuario) {
        console.log("🟢 [useLoanValidation] Usuário encontrado:", usuario.NUSP);
      } else {
        console.log("🟡 [useLoanValidation] Usuário não encontrado para NUSP:", nusp);
      }
      
      return usuario || null;
    } catch (err) {
      console.error("🔴 [useLoanValidation] Erro ao buscar usuário:", err);
      setError("Erro ao buscar usuário");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valida a senha de um usuário
   */
  const validatePassword = async (nusp: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔵 [useLoanValidation] Validando senha do usuário:", nusp);
      
      const res = await fetch(`/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NUSP: nusp, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const isValid = !!data && !!data.token;
        
        if (isValid) {
          console.log("🟢 [useLoanValidation] Senha válida");
        } else {
          console.log("🟡 [useLoanValidation] Senha inválida");
        }
        
        return isValid;
      }
      
      console.log("🟡 [useLoanValidation] Senha inválida");
      return false;
    } catch (err) {
      console.error("🔴 [useLoanValidation] Erro ao validar senha:", err);
      setError("Erro ao validar senha");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valida se um livro está disponível para empréstimo
   */
  const validateBook = async (bookId: string | number): Promise<Book | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔵 [useLoanValidation] Validando livro:", bookId);
      
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) {
        console.error("🔴 [useLoanValidation] Livro não encontrado:", bookId);
        return null;
      }

      const livro = await res.json();
      
      if (!livro) {
        console.log("🟡 [useLoanValidation] Livro não encontrado");
        return null;
      }

      if (livro.available === false) {
        console.log("🟡 [useLoanValidation] Livro não disponível para empréstimo");
        setError("Livro não disponível para empréstimo");
        return null;
      }

      console.log("🟢 [useLoanValidation] Livro válido e disponível:", livro.title);
      return livro;
    } catch (err) {
      console.error("🔴 [useLoanValidation] Erro ao validar livro:", err);
      setError("Erro ao validar livro");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpa o estado do hook
   */
  const reset = () => {
    setError(null);
  };

  return {
    findUserByNusp,
    validatePassword,
    validateBook,
    loading,
    error,
    reset,
  };
}
