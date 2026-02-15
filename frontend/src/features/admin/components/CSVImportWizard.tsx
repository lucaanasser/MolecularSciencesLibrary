import React, { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText } from "lucide-react";
import ActionBar from "@/features/admin/components/ActionBar";

interface AdminCSVImportWizardProps {
  importFunction: (csvFile: File) => Promise<any>; // função de importação
  instructions: React.ReactNode;
  onCancel: () => void;
  onSuccess: (results: any) => void;
  onError?: (error: Error) => void;
  templateCsv?: string; // CSV string para download opcional
  templateName?: string; // Nome do arquivo para download
}

const CSVImportWizard: React.FC<AdminCSVImportWizardProps> = ({
  importFunction,
  instructions,
  onCancel,
  onSuccess,
  onError,
  templateCsv,
  templateName = "template.csv",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; error: any }>({ open: false, error: null });

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
    try {
      const result = await importFunction(file);
      onSuccess("Importação concluída com sucesso!");
    } catch(err){
      onError(err)
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };
  
  const handleDownloadTemplate = () => {
    if (!templateCsv) return;
    const blob = new Blob(['\ufeff' + templateCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = templateName;
    link.click();
  };

  return (

    <>
      <div className="mb-4">
        <p className="font-semibold mb-2">Formato do CSV</p>
        {instructions}
        {templateCsv && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadTemplate}
            className="mt-2 bg-cm-blue"
          >
            Baixar Template
          </Button>
        )}
      </div>

      {!file && (
        <Alert className="p-0 border-none">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
              isDragging
                ? 'border-cm-blue bg-cm-blue/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm mb-2">
              Arraste e solte um arquivo CSV aqui
              <br/>
              ou
            </p>
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <Button 
                type="button" 
                variant="primary" 
                size="sm"
                className="bg-cm-green" 
                asChild>
                <span>Selecionar Arquivo</span>
              </Button>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </Label>
          </div>
        </Alert>
      )}

      {file && !result && (
        <Alert>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="prose-sm">{file.name}</span>
                <span className="text-xs text-gray-600"></span>
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
          </AlertDescription>
        </Alert>
      )}


      {/* Dialog de erro detalhado */}
      <AlertDialog open={errorDialog.open} onOpenChange={open => {
        setErrorDialog(v => ({ ...v, open }));
        if (!open) {
          setFile(null); // garantir reset ao fechar
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erro ao importar CSV</AlertDialogTitle>
            <AlertDialogDescription>
              {errorDialog.error && (
                <div>
                  {errorDialog.error.message && <p>{errorDialog.error.message}</p>}
                  {errorDialog.error.errors && Array.isArray(errorDialog.error.errors) && (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {errorDialog.error.errors.map((err: any, idx: number) => (
                        <div key={idx} className="prose-sm text-cm-red">
                          <span className="font-semibold">Linha {err.row}:</span> {err.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, error: null })}>
              Voltar para upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-4">
        <ActionBar
          showCancel={true}
          showConfirm={!result}
          confirmLabel={isUploading ? "Importando..." : "Importar"}
          onCancel={result ? onCancel : onCancel}
          onConfirm={handleUpload}
          loading={isUploading}
          confirmColor={!file ? "bg-gray-400" : "bg-cm-blue"}
        />
      </div>
    </>
  );
};

export default CSVImportWizard;