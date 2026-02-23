import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";

export default function CompleteReportCard() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/api/reports/complete/pdf');
      if (!res.ok) throw new Error('Erro ao gerar PDF');
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `relatorio_completo_biblioteca_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="rounded-xl h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Relatório Completo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-4 gap-3">
        <Button 
          onClick={handleDownloadPDF} 
          className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
          disabled={downloading}
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Baixar PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
