import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Heart, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

interface DonatorsSummary {
  totalDonators: number;
  totalDonations: number;
  bookDonations: number;
  monetaryDonations: number;
  totalMonetaryValue: number;
}

interface DonatorsData {
  summary: DonatorsSummary;
  donationsByMonth: Array<{ month: string; books: number; monetary: number }>;
  topDonators: Array<{ 
    id: number; name: string; email: string; phone: string;
    total_donations: number; books_donated: number; monetary_donated: number 
  }>;
  recentDonations: Array<{ 
    id: number; donator_name: string; type: string; 
    value: number; book_title: string; created_at: string 
  }>;
  period: { startDate: string | null; endDate: string | null };
}

const COLORS = ['#6B21A8', '#1E40AF', '#16A34A', '#F59E0B', '#DC2626'];

export default function DonatorsReportView() {
  const [data, setData] = useState<DonatorsData | null>(null);
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
      let url = '/api/reports/donators';
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
      let url = '/api/reports/donators/pdf';
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
      a.download = `relatorio_doadores_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-red-500">Erro ao carregar dados</div>;
  }

  // Dados para gráfico de pizza (tipo de doação)
  const donationTypeData = [
    { name: 'Livros', value: data.summary.bookDonations },
    { name: 'Dinheiro', value: data.summary.monetaryDonations }
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="rounded-xl border-l-4 border-l-purple-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{data.summary.totalDonators}</div>
                <div className="text-xs text-gray-600">Doadores</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-blue-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{data.summary.totalDonations}</div>
                <div className="text-xs text-gray-600">Total Doações</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-500">{data.summary.bookDonations}</div>
                <div className="text-xs text-gray-600">Livros</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-green-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{data.summary.monetaryDonations}</div>
                <div className="text-xs text-gray-600">Monetárias</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-emerald-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="text-lg font-bold text-emerald-600">
                  {formatCurrency(data.summary.totalMonetaryValue)}
                </div>
                <div className="text-xs text-gray-600">Valor Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de pizza - Tipo de doação */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tipo de Doação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={donationTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#F59E0B" />
                  <Cell fill="#16A34A" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Doações por mês */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Doações por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.donationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend />
                <Bar dataKey="books" fill="#F59E0B" name="Livros" />
                <Bar dataKey="monetary" fill="#16A34A" name="Dinheiro" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Doadores */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Maiores Doadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Telefone</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-right p-2">Livros</th>
                  <th className="text-right p-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.topDonators.slice(0, 15).map((donator, i) => (
                  <tr key={donator.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2 font-medium">{donator.name}</td>
                    <td className="p-2">{donator.email || '-'}</td>
                    <td className="p-2">{donator.phone || '-'}</td>
                    <td className="p-2 text-right">
                      <Badge className="bg-purple-100 text-purple-800">{donator.total_donations}</Badge>
                    </td>
                    <td className="p-2 text-right">{donator.books_donated}</td>
                    <td className="p-2 text-right font-semibold text-green-600">
                      {donator.monetary_donated > 0 ? formatCurrency(donator.monetary_donated) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Doações Recentes */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Doações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Doador</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Detalhe</th>
                  <th className="text-left p-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.recentDonations?.slice(0, 10).map((donation, i) => (
                  <tr key={donation.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2 font-medium">{donation.donator_name}</td>
                    <td className="p-2">
                      <Badge variant="outline" className={
                        donation.type === 'book' 
                          ? 'bg-orange-50 text-orange-700' 
                          : 'bg-green-50 text-green-700'
                      }>
                        {donation.type === 'book' ? 'Livro' : 'Dinheiro'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {donation.type === 'book' 
                        ? donation.book_title 
                        : formatCurrency(donation.value)}
                    </td>
                    <td className="p-2">
                      {new Date(donation.created_at).toLocaleDateString('pt-BR')}
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
