
import React from "react";
import CSVImportWizard from "@/features/admin/components/CSVImportWizard";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";


const ImportDonators: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  // Template CSV para doadores
  const templateCsv = `name,user_id,book_id,donation_type,amount,contact,notes\nJoão Silva,,1,book,,joao@email.com,Doou livro de Física\nMaria Santos,12345,,money,50.00,maria@email.com,Doação financeira\nPedro Costa,,2,book,,pedro@email.com,Doação de livro de Química`;

  // Instruções customizadas
  const instructions = (
    <div>
      <ul className="list-disc list-inside">
        <li><strong>name</strong>: Nome do doador (obrigatório)</li>
        <li><strong>user_id</strong>: NUSP do usuário (opcional)</li>
        <li><strong>book_id</strong>: ID do livro doado (obrigatório se donation_type = book)</li>
        <li><strong>donation_type</strong>: Tipo - "book" ou "money" (obrigatório)</li>
        <li><strong>amount</strong>: Valor em reais (obrigatório se donation_type = money)</li>
        <li><strong>contact</strong>: Email ou telefone (opcional)</li>
        <li><strong>notes</strong>: Observações (opcional)</li>
      </ul>
    </div>
  );

  return (
    <>
    </>
  );
};

export default ImportDonators;