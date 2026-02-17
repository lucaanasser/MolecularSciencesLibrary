import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, BookOpen, BookMarked,TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ReportsService } from "@/services/ReportsService";
import { COLORS } from "@/constants/colors";
import { StatsSidebar } from '@/components/StatsSidebar';
import ActionBar from '@/features/admin/components/ActionBar';

export default function BooksReportView( { onError, onBack } : {onError?: (error: any) => void, onBack?: () => void} = {}) {
  
  // Estados para dados, loading e download
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Função para buscar os dados do relatório
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await ReportsService.getBooksStatistics();
      setData(result);
    } catch (error) {
      onError && onError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Função para baixar o relatório em PDF
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const blob = await ReportsService.getBooksReportPDF?.();
      if (!blob) throw new Error('Erro ao gerar PDF');
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `relatorio_acervo_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      onError && onError(error);
    } finally {
      setDownloading(false);
    }
  };

  // Fallbacks da exibição
  if (loading) return <div className="text-center py-8">Carregando...</div>;
  if (!data) return <div className="text-center py-8 text-red-500 prose-lg">Erro ao carregar dados</div>;

  
  return (
    <div className="flex flex-col gap-4">
      
      {/* Header com botão de download */}
      <div className="flex gap-4 items-center">
        <h3 className='mb-0'>Dados do acervo</h3>
        <Button 
          onClick={handleDownloadPDF} 
          variant="default" 
          className="ml-auto"
          disabled={downloading}
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Gerando...' : 'Baixar PDF'}
        </Button>
      </div>

      {/* Resumo */}
      <StatsSidebar 
        layout='horizontal' 
        stats={[
          {
            icon: BookOpen,
            value: data.summary.total,
            label: "Total de Livros",
            shortLabel: "Total",
            bgColor: "bg-cm-blue/20",
            textColor: "text-cm-blue",
            iconBg: "bg-cm-blue"
          },
          {
            icon: BookMarked,
            value: data.summary.numberOfSubareas,
            label: "Total de Subáreas",
            shortLabel: "Subáreas",
            bgColor: "bg-cm-red/20",
            textColor: "text-cm-red",
            iconBg: "bg-cm-red"
          },
          {
            icon: TrendingUp,
            value: `${data.summary.circulationRate}%`,
            label: "Taxa de Circulação",
            shortLabel: "Circulação",
            bgColor: "bg-cm-green/20",
            textColor: "text-cm-green",
            iconBg: "bg-cm-green"
          }
        ]}
      />
      
      {/* Explicação da taxa de circulação */}
      <div className="prose-sm text-gray-500 mt-1 ml-1">
        <b>* Taxa de circulação:</b> Percentual de livros que já foram emprestados pelo menos uma vez desde a implementação do sistema.
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Gráfico de barras verticais - Livros por área */}
        <div>
          <h4>Livros por Área</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.booksByArea} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis type="number" dataKey="count" fontSize={12} />
              <XAxis type="category" dataKey="area" fontSize={12} width={120} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const sub = data.subareasByArea[label] || [];
                    return (
                      <div className="bg-white p-2 border rounded shadow text-xs">
                        <div><b>{label}</b></div>
                        <div>Livros: {payload[0].value}</div>
                        <div>Subáreas: {sub ? sub.length : 0}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" name="Livros">
                {data.booksByArea.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras horizontais - Livros por idioma */}
        <div>
          <h4>Livros por Idioma</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.booksByLanguage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="count" fontSize={12} />
              <YAxis type="category" dataKey="language" fontSize={12} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow text-xs">
                        <div><b>{label}</b></div>
                        <div>Livros: {payload[0].value}</div>
                      </div>
                    );
                  }
                  return null;
                  }} 
                />
              <Bar dataKey="count" fill={COLORS[6]} name="Livros" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de livros adicionados recentemente */}
      <div className="px-4 pt-4">
        <h4>Últimos 10 Livros Adicionados</h4>
        <div className="overflow-x-auto rounded-xl border gray-50">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-2">Título</th>
                <th className="text-left p-2">Autor</th>
                <th className="text-left p-2">Área</th>
                <th className="text-left p-2">Data Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {data.recentlyAdded?.slice(0, 10).map((book, i) => (
                <tr key={book.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white '}>
                  <td className="p-2 font-medium">{book.title}</td>
                  <td className="p-2">{book.author}</td>
                  <td className="p-2">{book.area}</td>
                  <td className="p-2">
                    {new Date(book.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão de voltar */}
      {onBack && 
        <ActionBar
          onCancel={onBack}
          showConfirm={false}
        />
      }
    </div>
  );
};