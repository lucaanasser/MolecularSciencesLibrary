import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, TrendingUp,BookOpen, BookMarked, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatsSidebar } from '@/components/StatsSidebar';
import { COLORS } from "@/constants";
import ActionBar from '@/features/admin/components/ActionBar';
import { ReportsService } from '@/services/ReportsService';

export default function LoansReportView( { onError, onBack } : {onError?: (error: any) => void, onBack?: () => void} = {})  {
  // Estados para dados, loading e download
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Função para buscar os dados do relatório
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await ReportsService.getLoansStatistics();
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
      const blob = await ReportsService.getLoansReportPDF?.();
      if (!blob) throw new Error('Erro ao gerar PDF');
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `relatorio_emprestimos_${new Date().toISOString().split('T')[0]}.pdf`;
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

  // Dados para gráficos
  const pieData = [
    { name: 'Uso Interno', value: data.summary.internalUse },
    { name: 'Externos', value: data.summary.external }
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Header com botão de download*/}
      <div className="flex gap-4 items-center">
        {/* Título do relatório */}
        <h3 className='mb-0'>Dados de Empréstimos</h3>

        {/* Botão de download */}
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
        stats = {[
          {
            icon: TrendingUp,
            value: data.summary.total,
            label: "Empréstimos",
            shortLabel: "Total",
            bgColor: "bg-cm-blue/20",
            textColor: "text-cm-blue",
            iconBg: "bg-cm-blue"
          },
          {
            icon: Clock,
            value: data.summary.active,
            label: "Ativos",
            shortLabel: "Ativos",
            bgColor: "bg-cm-green/20",
            textColor: "text-cm-green",
            iconBg: "bg-cm-green"
          },
          {
            icon: BookMarked,
            value: data.summary.overdue,
            label: "Atrasados",
            shortLabel: "Atrasados",
            bgColor: "bg-cm-red/20",
            textColor: "text-cm-red",
            iconBg: "bg-cm-red"
          },
          {
            icon: BookOpen,
            value: data.summary.avgRenewals,
            label: "Média de Renovações",
            shortLabel: "Média",
            bgColor: "bg-cm-yellow/20",
            textColor: "text-cm-yellow",
            iconBg: "bg-cm-yellow"
          }
        ]} 
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de barras verticais - Empréstimos por mês */}
        <div>
          <h4>Empréstimos por mês (Último ano)</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.loansByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={14} />
              <YAxis fontSize={14} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow text-xs">
                        <div><b>{label}</b></div>
                        <div>Empréstimos: {payload[0].value}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/*<Legend />*/}
              <Bar dataKey="total" fill={COLORS[6]} name="Total de empréstimos" />
              {/*<Bar dataKey="internal" fill="#F59E0B" name="Interno" /> estou comentand esses pois n temos mtos usos internos ainda*/}
              {/*<Bar dataKey="external" fill="#16A34A" name="Externo" />*/}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras verticais - Empréstimos por mês */}
        <div>
          <h4>Empréstimos por dia da semana</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.loansByDayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day_name" fontSize={14} />
              <YAxis dataKey="percent" fontSize={14} unit="%" domain={[0,25]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow text-xs">
                        <div><b>{label}</b></div>
                        <div>% de empréstimos: {payload[0].value}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="percent" name="Total de empréstimos" fill={COLORS[5]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Top 10 livros mais emprestados */}
      <div className="px-4 pt-4">
        <h4>Top 10 Livros Mais Emprestados</h4>
        <div className="overflow-x-auto rounded-xl border gray-50">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-2">Título</th>
                <th className="text-left p-2">Autores</th>
                <th className="text-left p-2">Área</th>
                <th className="text-left p-2">Empréstimos</th>
              </tr>
            </thead>
            <tbody>
              {data.topBooks?.slice(0, 10).map((book, i) => (
                <tr key={book.id || book.title} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 font-medium">{book.title}</td>
                  <td className="p-2">{book.authors || '-'}</td>
                  <td className="p-2">{book.area || '-'}</td>
                  <td className="p-2">{book.loan_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {onBack && <ActionBar
        onCancel={onBack}
        showConfirm={false}
      />}
    </div>
  );
};