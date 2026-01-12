import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ImportBooksCSVProps {
  onCancel: () => void;
  onSuccess: (results: any) => void;
  onError?: (error: Error) => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

export default function ImportBooksCSV({ onCancel, onSuccess, onError }: ImportBooksCSVProps) {
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
      const response = await fetch('/api/books/import/csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao importar livros');
      }

      setResult(data);
      if (data.success > 0) {
        onSuccess(data);
      }
    } catch (error: any) {
      console.error('🔴 [ImportBooksCSV] Erro ao importar:', error);
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Livros via CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  Remover
                </Button>
              </div>
            </div>
          )}

          {/* Resultado da importação */}
          {result && (
            <div className="space-y-3">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>{result.success}</strong> livro(s) importado(s) com sucesso
                </AlertDescription>
              </Alert>

              {result.failed > 0 && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <strong>{result.failed}</strong> livro(s) falharam na importação
                  </AlertDescription>
                </Alert>
              )}

              {result.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {result.errors.map((error, idx) => (
                    <Alert key={idx} variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Linha {error.row}:</strong> {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Informações sobre formato CSV */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <h4 className="font-semibold mb-2 text-blue-900">Formato do CSV:</h4>
            <ul className="space-y-1 text-blue-800 text-xs">
              <li>• <strong>Campos obrigatórios:</strong> code, title, authors, area, subarea, edition, language, volume</li>
              <li>• <strong>Campos opcionais:</strong> subtitle, isbn, year, publisher, observations, barcode</li>
              <li className="text-red-700 font-semibold">⚠️ O <strong>código do livro (code)</strong> deve ser fornecido seguindo os Padrões da Biblioteca</li>
              <li>• O <strong>código de barras</strong> será gerado automaticamente se não for fornecido</li>
              <li>• Livros iguais devem ter o mesmo código</li>
              <li>• Exemplo de cabeçalho CSV:</li>
            </ul>
            <code className="block mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
              code,title,authors,area,subarea,edition,language,volume,subtitle,isbn,year,publisher,barcode
            </code>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isUploading}>
              {result ? 'Fechar' : 'Cancelar'}
            </Button>
            {file && !result && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-cm-blue hover:bg-cm-blue/90"
              >
                {isUploading ? 'Importando...' : 'Importar Livros'}
              </Button>
            )}
            {result && (
              <Button onClick={handleReset} className="bg-cm-green hover:bg-cm-green/90">
                Importar Outro Arquivo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
