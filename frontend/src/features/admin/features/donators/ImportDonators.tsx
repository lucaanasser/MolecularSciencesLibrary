
import CSVImportWizard from "@/features/admin/components/CSVImportWizard";
import { DonatorsService } from "@/services/DonatorsService";

export default function ImportDonators({ onBack, onSuccess, onError }) {
  // Template CSV para doadores
  const templateCsv = `name,tag,user_id,book_id,donation_type,amount,contact,notes\nJoão Silva,,12345,1,book,,joao@email.com,Doou livro de Física\nMaria Santos,Prof.,,, money,50.00,maria@email.com,Doação financeira\nPedro Costa,T27,,2,book,,pedro@email.com,Doação de livro de Química`;

  // Instruções customizadas
  const instructions = (
    <div className="prose-xs">
      <div className="font-semibold">Campos obrigatórios:</div>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>name</strong>: Nome do doador</li>
        <li><strong>donation_type</strong>: Tipo - "book" ou "money"</li>
      </ul>

      <div className="font-semibold mt-4">Campos opcionais:</div>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>tag</strong>: Etiqueta/turma do doador (ex: "Prof.", "T27")</li>
        <li><strong>user_id</strong>: NUSP do doador (se for usuário cadastrado)</li>
        <li><strong>book_id</strong>: ID do livro doado (obrigatório se donation_type = book)</li>
        <li><strong>amount</strong>: Valor em reais (obrigatório se donation_type = money)</li>
        <li><strong>contact</strong>: Email ou telefone</li>
        <li><strong>notes</strong>: Observações</li>
      </ul>
    </div>
  );

  return (
    <CSVImportWizard
      importFunction={DonatorsService.importDonatorsFromCSV}
      templateCsv={templateCsv}
      templateName="template_doadores.csv"
      instructions={instructions}
      onCancel={onBack}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
};