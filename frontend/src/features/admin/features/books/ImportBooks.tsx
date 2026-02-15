import React from "react";
import CSVImportWizard from "@/features/admin/components/CSVImportWizard";
import { BooksService } from "@/services/BooksService";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const ImportBooks: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  // Template CSV para livros com todos os campos
  const templateCsv = `code,title,authors,area,subarea,edition,language,volume,subtitle,barcode
FIS-01.01,Física Experimental I,"Silva, João",FIS,1,1,1,0,,9781234567890
QUI-02.01,Química Orgânica,"Santos, Maria",QUI,4,2,2,0,,9789876543210
MAT-03.02,Cálculo III,"Costa, Pedro",MAT,1,3,1,1,,`;

  // Instruções customizadas
  const instructions = (
    <div className="prose-xs">
      <div className="font-semibold">Campos obrigatórios:</div>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>code</strong>: Código do livro no padrão ÁREA-SUBÁREA.SEQ (v. VOLUME) (ex: FIS-01.01, BIO-03.09 v.4)</li>
        <li><strong>title</strong>: Título do livro</li>
        <li><strong>authors</strong>: Autor(es) do livro (separados por vírgula se múltiplos)</li>
        <li><strong>area</strong>: Área do conhecimento (MAT, FIS, QUI, BIO, CMP, VAR)</li>
        <li><strong>subarea</strong>: Subárea específica (1, 2, 3, ...)</li>
        <li><strong>edition</strong>: Edição do livro (ex: 1, 2, 3, ...)</li>
        <li><strong>language</strong>: Idioma (Português: 1, Inglês: 2, Espanhol: 3, Outros: 4)</li>
        <li><strong>volume</strong>: Número do volume (preencha com 0 se não aplicável)</li>
      </ul>
      
      <div className="font-semibold mt-4">Campos opcionais:</div>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>subtitle</strong>: Subtítulo do livro</li>
        <li><strong>barcode</strong>: Código de barras EAN-13 único (será usado como ID). Se não fornecido, será gerado automaticamente</li>
      </ul>

      <div className="bg-blue-50 rounded-xl px-4 py-2 my-4">
        <div className="font-semibold text-blue-800">Informações Importantes:</div>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Livros iguais:</strong> Exemplares do mesmo livro devem ter o mesmo <code>code</code></li>
          <li>Os campos <strong>isbn</strong>, <strong>year</strong> e <strong>publisher</strong> são aceitos para compatibilidade, mas não são salvos no banco</li>
        </ul>
      </div>
    </div>
  );

  return (
    <CSVImportWizard
      importFunction={BooksService.importBooksFromCSV}
      instructions={instructions}
      onCancel={onBack}
      onSuccess={onSuccess}
      onError={onError}
      templateCsv={templateCsv}
      templateName="template_livros.csv"
    />
  );
};

export default ImportBooks;
