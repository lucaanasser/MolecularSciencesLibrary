import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, Users, BookOpen, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

interface LoansSummary {
  total: number;
  active: number;
  returned: number;
  overdue: number;
  internalUse: number;
  external: number;
  renewalRate: string;
  avgRenewals: string;
}

interface LoansData {
  summary: LoansSummary;
  loansByMonth: Array<{ month: string; total: number; internal: number; external: number }>;
  topBooks: Array<{ id: number; code: string; title: string; authors: string; loan_count: number }>;
  topUsers: Array<{ id: number; name: string; NUSP: string; role: string; loan_count: number }>;
  loansByDayOfWeek: Array<{ day_name: string; total: number }>;
  period: { startDate: string | null; endDate: string | null };
}

const COLORS = ['#6B21A8', '#1E40AF', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899'];

export default function LoansReportView() {
  const [data, setData] = useState<LoansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '/api/reports/loans';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += '?' + params.toString();
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao buscar dados');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchData();
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      let url = '/api/reports/loans/pdf';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += '?' + params.toString();
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao gerar PDF');
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `relatorio_emprestimos_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-red-500">Erro ao carregar dados</div>;
  }

  // Dados para gráfico de pizza (interno vs externo)
  const pieData = [
    { name: 'Uso Interno', value: data.summary.internalUse },
    { name: 'Externos', value: data.summary.external }
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="rounded-xl">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Data Início</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Data Fim</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleFilter} className="bg-cm-blue hover:bg-cm-blue/90">
              Filtrar
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              variant="default" 
              className="gap-2"
              disabled={downloading}
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Gerando...' : 'Baixar PDF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="rounded-xl border-l-4 border-l-blue-600">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{data.summary.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-green-600">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{data.summary.active}</div>
            <div className="text-xs text-gray-600">Ativos</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-purple-600">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{data.summary.returned}</div>
            <div className="text-xs text-gray-600">Devolvidos</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-red-600">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{data.summary.overdue}</div>
            <div className="text-xs text-gray-600">Atrasados</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-500">{data.summary.internalUse}</div>
            <div className="text-xs text-gray-600">Uso Interno</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-cyan-600">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-cyan-600">{data.summary.external}</div>
            <div className="text-xs text-gray-600">Externos</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de linha - Empréstimos por mês */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Empréstimos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.loansByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#1E40AF" name="Total" strokeWidth={2} />
                <Line type="monotone" dataKey="internal" stroke="#F59E0B" name="Interno" strokeWidth={2} />
                <Line type="monotone" dataKey="external" stroke="#16A34A" name="Externo" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pizza - Interno vs Externo */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Uso Interno vs Externo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Livros */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Top 10 Livros Mais Emprestados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topBooks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={10} />
              <YAxis 
                type="category" 
                dataKey="title" 
                width={200} 
                fontSize={10}
                tickFormatter={(value) => value.length > 30 ? value.substring(0, 30) + '...' : value}
              />
              <Tooltip />
              <Bar dataKey="loan_count" fill="#6B21A8" name="Empréstimos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Usuários */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            Top 10 Usuários Mais Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">NUSP</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-right p-2">Empréstimos</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((user, i) => (
                  <tr key={user.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2 font-mono">{user.NUSP}</td>
                    <td className="p-2">
                      <Badge variant="default">{user.role}</Badge>
                    </td>
                    <td className="p-2 text-right font-semibold">{user.loan_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
