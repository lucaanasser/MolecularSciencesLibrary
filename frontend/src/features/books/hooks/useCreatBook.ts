import { useState } from 'react';
import { BookFormData } from '../types/book';

export interface AddBookResult {
  success: boolean;
  data?: any;
  error?: Error;
}

export default function useAddBook() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addBook = async (bookData: BookFormData): Promise<AddBookResult> => {
    setIsSubmitting(true);
    
    try {
      // Enviar os dados para a API
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar livro');
      }

      const result = await response.json();
      console.log('Livro adicionado com sucesso:', result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao adicionar livro:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido ao adicionar livro') 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addBook, isSubmitting };
}