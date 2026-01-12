import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";

interface ImportDonatorsCSVProps {
  onCancel: () => void;
  onSuccess: (results: any) => void;
  onError?: (error: Error) => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

export default function ImportDonatorsCSV({ onCancel, onSuccess, onError }: ImportDonatorsCSVProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setResult(null);
    } else {
      alert('Por favor, selecione um arquivo CSV válido');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch('/api/donators/import/csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao importar doadores');
      }

      setResult(data);
      if (data.success > 0) {
        onSuccess(data);
      }
    } catch (error: any) {
      console.error('🔴 [ImportDonatorsCSV] Erro ao importar:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  const handleDownloadTemplate = () => {
    const template = `name,user_id,book_id,donation_type,amount,contact,notes
João Silva,,1,book,,joao@email.com,Doou livro de Física
Maria Santos,12345,,money,50.00,maria@email.com,Doação financeira
Pedro Costa,,2,book,,pedro@email.com,Doação de livro de Química`;

    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_doadores.csv';
    link.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Doadores via CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instruções */}
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
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="mt-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Template
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Área de drag & drop */}
          {!file && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-cm-blue bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Arraste e solte um arquivo CSV aqui
              </p>
              <p className="text-xs text-gray-500 mb-4">ou</p>
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>Selecionar Arquivo</span>
                </Button>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Arquivo selecionado */}
          {file && !result && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isUploading}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Resultado da importação */}
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Sucesso</p>
                      <p className="text-2xl font-bold text-green-600">{result.success}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Falhas</p>
                      <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                    </div>
                  </div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-900 mb-2">Erros encontrados:</p>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-800">
                        <span className="font-semibold">Linha {error.row}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                Importar outro arquivo
              </Button>
            </div>
          )}

          {/* Botões de ação */}
          {!result && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="flex-1 bg-cm-green hover:bg-cm-green/80"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </>
                )}
              </Button>
            </div>
          )}

          {result && (
            <Button
              onClick={onCancel}
              className="w-full bg-cm-blue hover:bg-cm-blue/80"
            >
              Concluir
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
