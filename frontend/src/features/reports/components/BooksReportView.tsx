import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, BookOpen, BookMarked, BookX, Building2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface BooksSummary {
  total: number;
  available: number;
  borrowed: number;
  reserved: number;
  internalUse: number;
}

interface BooksData {
  summary: BooksSummary;
  booksByArea: Array<{ area: string; total: number }>;
  booksByLanguage: Array<{ language: string; total: number }>;
  mostBorrowed: Array<{ 
    id: number; title: string; author: string; area: string; 
    total_loans: number; is_available: number 
  }>;
  internalUsageBooks: Array<{ 
    id: number; title: string; author: string; 
    internal_loans: number; total_loans: number 
  }>;
  recentlyAdded: Array<{ 
    id: number; title: string; author: string; 
    area: string; created_at: string 
  }>;
}

const COLORS = ['#6B21A8', '#1E40AF', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function BooksReportView() {
  const [data, setData] = useState<BooksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports/books');
      if (!res.ok) throw new Error('Erro ao buscar dados');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/api/reports/books/pdf');
      if (!res.ok) throw new Error('Erro ao gerar PDF');
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `relatorio_acervo_${new Date().toISOString().split('T')[0]}.pdf`;
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

  // Dados para gráfico de pizza (por área)
  const areaData = data.booksByArea.map(a => ({
    name: a.area || 'Não definido',
    value: a.total
  }));

  // Dados para uso interno vs. externo
  const usageData = [
    { name: 'Uso Externo', value: data.summary.total - data.summary.internalUse },
    { name: 'Uso Interno', value: data.summary.internalUse }
  ];

  return (
    <div className="space-y-6">
      {/* Header com botão de download */}
      <Card className="rounded-xl">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Relatório do acervo atual da biblioteca (dados em tempo real)
            </p>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="rounded-xl border-l-4 border-l-blue-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
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
              <BookMarked className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{data.summary.available}</div>
                <div className="text-xs text-gray-600">Disponíveis</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookX className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-500">{data.summary.borrowed}</div>
                <div className="text-xs text-gray-600">Emprestados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-purple-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{data.summary.reserved}</div>
                <div className="text-xs text-gray-600">Reservados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-gray-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-2xl font-bold text-gray-500">{data.summary.internalUse}</div>
                <div className="text-xs text-gray-600">Uso Interno</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de pizza - Por área */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Livros por Área</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={areaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Top 10 mais emprestados */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Livros Mais Emprestados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart 
                data={data.mostBorrowed.slice(0, 10).map(b => ({
                  name: b.title.length > 15 ? b.title.substring(0, 15) + '...' : b.title,
                  emprestimos: b.total_loans
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={10} />
                <YAxis type="category" dataKey="name" fontSize={9} width={100} />
                <Tooltip />
                <Bar dataKey="emprestimos" fill="#6B21A8" name="Empréstimos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Uso interno vs externo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Uso Interno vs. Externo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={usageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#16A34A" />
                  <Cell fill="#6B7280" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Livros por idioma */}
        {data.booksByLanguage && data.booksByLanguage.length > 0 && (
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Livros por Idioma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.booksByLanguage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="language" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1E40AF" name="Livros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela de livros com uso interno */}
      {data.internalUsageBooks && data.internalUsageBooks.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Livros com Maior Uso Interno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Título</th>
                    <th className="text-left p-2">Autor</th>
                    <th className="text-right p-2">Uso Interno</th>
                    <th className="text-right p-2">Total Emp.</th>
                    <th className="text-right p-2">% Interno</th>
                  </tr>
                </thead>
                <tbody>
                  {data.internalUsageBooks.slice(0, 10).map((book, i) => (
                    <tr key={book.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-2 font-medium">{book.title}</td>
                      <td className="p-2">{book.author}</td>
                      <td className="p-2 text-right font-semibold">{book.internal_loans}</td>
                      <td className="p-2 text-right">{book.total_loans}</td>
                      <td className="p-2 text-right">
                        <Badge className="bg-gray-100 text-gray-800">
                          {book.total_loans > 0 
                            ? ((book.internal_loans / book.total_loans) * 100).toFixed(0) 
                            : 0}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Livros adicionados recentemente */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Livros Adicionados Recentemente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Título</th>
                  <th className="text-left p-2">Autor</th>
                  <th className="text-left p-2">Área</th>
                  <th className="text-left p-2">Data Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {data.recentlyAdded?.slice(0, 10).map((book, i) => (
                  <tr key={book.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2 font-medium">{book.title}</td>
                    <td className="p-2">{book.author}</td>
                    <td className="p-2">
                      <Badge variant="default">{book.area || 'Não definida'}</Badge>
                    </td>
                    <td className="p-2">
                      {new Date(book.created_at).toLocaleDateString('pt-BR')}
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
