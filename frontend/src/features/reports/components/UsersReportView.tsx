import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { COLORS } from "@/constants/colors";
import { ReportsService } from "@/services/ReportsService";
import { StatsSidebar } from '@/components/StatsSidebar';
import ActionBar from '@/features/admin/components/ActionBar';

export default function UsersReportView( { onError, onBack } : {onError?: (error: any) => void, onBack?: () => void} = {})  {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await ReportsService.getUsersStatistics();
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

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const blob = await ReportsService.getUsersReportPDF?.();
      if (!blob) throw new Error('Erro ao gerar PDF');
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `relatorio_usuarios_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      onError && onError(error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;
  if (!data) return <div className="text-center py-8 text-red-500 prose-lg">Erro ao carregar dados</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Header com botão de download */}
      <div className="flex gap-4 items-center">
        <h3 className='mb-0'>Dados dos usuários</h3>
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
            icon: Users,
            value: data.summary.total,
            label: "Total de Usuários",
            shortLabel: "Total",
            bgColor: "bg-cm-blue/20",
            textColor: "text-cm-blue",
            iconBg: "bg-cm-blue"
          },
          {
            icon: UserCheck,
            value: data.summary.active,
            label: "Usuários Ativos",
            shortLabel: "Ativos",
            bgColor: "bg-cm-green/20",
            textColor: "text-cm-green",
            iconBg: "bg-cm-green"
          }
        ]}
      />

      {/* Explicação usuários ativos */}
      <div className="prose-sm text-gray-500 mt-1 ml-1">
        <b>* Usuários ativos:</b> Realizaram empréstimos nos últimos 6 meses.
      </div>
      

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de barras horizontais - Usuários por turma */}
        <div>
          <h4>Usuários por Turma</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.usersByClass} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis type="category" dataKey="class" fontSize={10} />
              <XAxis type="number" fontSize={10} />
              <Tooltip />
              <Bar dataKey="total" fill="#6B21A8" name="Usuários" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de usuários mais ativos */}
      <div className="bg-white px-4 pt-4">
        <h4>Top 10 Usuários Mais Ativos</h4>
        <div className="overflow-x-auto rounded-xl border gray-50">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-2">Nome</th>
                <th className="text-left p-2">Turma</th>
                <th className="text-right p-2"># Empréstimos</th>
              </tr>
            </thead>
            <tbody>
              {data.topBorrowers.map((user, i) => (
                <tr key={user.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.class || '-'}</td>
                  <td className="p-2 text-right font-semibold">{user.total_loans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão de voltar */}
      {onBack && <ActionBar
        onCancel={onBack}
        showConfirm={false}
      />}
    </div>
  );
}