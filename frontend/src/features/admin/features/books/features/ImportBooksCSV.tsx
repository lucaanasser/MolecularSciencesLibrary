
import CSVImportWizard from "@/features/common/CSVImportWizard";

interface ImportBooksCSVProps {
  onCancel: () => void;
  onSuccess: (results: any) => void;
  onError?: (error: Error) => void;
}

export default function ImportBooksCSV({ onCancel, onSuccess, onError }: ImportBooksCSVProps) {
  return (
    <CSVImportWizard
      endpoint="/api/books/import/csv"
      requiredFields={["code", "title", "authors", "area", "subarea", "edition", "language", "volume"]}
      instructions={
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <h4 className="font-semibold mb-2 text-blue-900">Formato do CSV:</h4>
          <ul className="space-y-1 text-blue-800 text-xs">
            <li>• <strong>Campos obrigatórios:</strong> code, title, authors, area, subarea, edition, language, volume</li>
            <li>• <strong>Campos opcionais:</strong> subtitle, barcode</li>
            <li className="text-yellow-700 text-xs">ℹ️ Os campos isbn, year e publisher são aceitos no CSV para compatibilidade, mas <strong>não são salvos</strong> no banco de dados</li>
            <li className="text-red-700 font-semibold">⚠️ O <strong>código do livro (code)</strong> deve ser fornecido seguindo os Padrões da Biblioteca</li>
            <li>• O <strong>código de barras (barcode)</strong> será usado como ID do livro. Se não fornecido, será gerado automaticamente</li>
            <li>• Livros iguais devem ter o mesmo código</li>
            <li>• Exemplo de cabeçalho CSV:</li>
          </ul>
          <code className="block mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
            code,title,authors,area,subarea,edition,language,volume,subtitle,isbn,year,publisher,barcode
          </code>
        </div>
      }
      onCancel={onCancel}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
