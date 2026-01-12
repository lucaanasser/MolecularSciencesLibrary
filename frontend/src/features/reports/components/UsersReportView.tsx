import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface UsersSummary {
  total: number;
  active: number;
  inactive: number;
  withOverdue: number;
}

interface UsersData {
  summary: UsersSummary;
  usersByRole: Array<{ role: string; total: number }>;
  newUsersByMonth: Array<{ month: string; total: number }>;
  usersByClass: Array<{ class: string; total: number }>;
  topBorrowers: Array<{ 
    id: number; name: string; NUSP: string; role: string; 
    class: string; total_loans: number; active_loans: number 
  }>;
  period: { startDate: string | null; endDate: string | null };
}

const COLORS = ['#6B21A8', '#1E40AF', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899'];

export default function UsersReportView() {
  const [data, setData] = useState<UsersData | null>(null);
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
      let url = '/api/reports/users';
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
      let url = '/api/reports/users/pdf';
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
      a.download = `relatorio_usuarios_${new Date().toISOString().split('T')[0]}.pdf`;
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

  // Dados para gráfico de pizza (por role)
  const roleData = data.usersByRole.map(r => ({
    name: r.role || 'Não definido',
    value: r.total
  }));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="rounded-xl">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Data Início (cadastro)</label>
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
            <Button onClick={handleFilter} className="bg-cm-orange hover:bg-cm-orange/90">
              Filtrar
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              variant="outline" 
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-xl border-l-4 border-l-blue-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{data.summary.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-green-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{data.summary.active}</div>
                <div className="text-xs text-gray-600">Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-gray-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-2xl font-bold text-gray-500">{data.summary.inactive}</div>
                <div className="text-xs text-gray-600">Inativos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-red-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{data.summary.withOverdue}</div>
                <div className="text-xs text-gray-600">Com Atrasos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de pizza - Por tipo */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Usuários por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Novos cadastros por mês */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Novos Cadastros por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.newUsersByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="total" fill="#F59E0B" name="Novos Usuários" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Usuários por turma */}
      {data.usersByClass && data.usersByClass.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Usuários por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.usersByClass.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="total" fill="#6B21A8" name="Usuários" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Usuários */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Usuários Mais Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">NUSP</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Turma</th>
                  <th className="text-right p-2">Total Emp.</th>
                  <th className="text-right p-2">Ativos</th>
                </tr>
              </thead>
              <tbody>
                {data.topBorrowers.slice(0, 15).map((user, i) => (
                  <tr key={user.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2 font-mono">{user.NUSP}</td>
                    <td className="p-2">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="p-2">{user.class || '-'}</td>
                    <td className="p-2 text-right font-semibold">{user.total_loans}</td>
                    <td className="p-2 text-right">
                      {user.active_loans > 0 ? (
                        <Badge className="bg-green-100 text-green-800">{user.active_loans}</Badge>
                      ) : '-'}
                    </td>
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
