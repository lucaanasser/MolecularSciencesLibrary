
import CSVImportWizard from "@/features/common/CSVImportWizard";

interface ImportDonatorsCSVProps {
  onCancel: () => void;
  onSuccess: (results: any) => void;
  onError?: (error: Error) => void;
}

export default function ImportDonatorsCSV({ onCancel, onSuccess, onError }: ImportDonatorsCSVProps) {
  // Template para download
  const handleDownloadTemplate = () => {
    const template = `name,user_id,book_id,donation_type,amount,contact,notes\nJoão Silva,,1,book,,joao@email.com,Doou livro de Física\nMaria Santos,12345,,money,50.00,maria@email.com,Doação financeira\nPedro Costa,,2,book,,pedro@email.com,Doação de livro de Química`;
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_doadores.csv';
    link.click();
  };

  return (
    <CSVImportWizard
      endpoint="/api/donators/import/csv"
      requiredFields={["name", "donation_type"]}
      instructions={
        <div className="space-y-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Formato do CSV:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li><strong>name</strong>: Nome do doador (obrigatório)</li>
                  <li><strong>user_id</strong>: NUSP do usuário (opcional)</li>
                  <li><strong>book_id</strong>: ID do livro doado (obrigatório se donation_type = book)</li>
                  <li><strong>donation_type</strong>: Tipo - "book" ou "money" (obrigatório)</li>
                  <li><strong>amount</strong>: Valor em reais (obrigatório se donation_type = money)</li>
                  <li><strong>contact</strong>: Email ou telefone (opcional)</li>
                  <li><strong>notes</strong>: Observações (opcional)</li>
                </ul>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="mt-2"
                >
                  Baixar Template
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      }
      onCancel={onCancel}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
