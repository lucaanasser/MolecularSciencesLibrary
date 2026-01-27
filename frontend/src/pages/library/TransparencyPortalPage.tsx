import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, BookOpen, BookMarked, BookX, Users, UserCheck, TrendingUp, Clock, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#6B21A8', '#1E40AF', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

interface LoansSummary {
  total: number;
  active: number;
  returned: number;
  overdue: number;
  internalUse: number;
  external: number;
}

interface UsersSummary {
  total: number;
  active: number;
  inactive: number;
}

interface BooksSummary {
  total: number;
  available: number;
  borrowed: number;
  reserved: number;
  internalUse: number;
}

export default function TransparencyPortalPage() {
  const [loansData, setLoansData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);
  const [booksData, setBooksData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [loansRes, usersRes, booksRes] = await Promise.all([
        fetch('/api/reports/loans'),
        fetch('/api/reports/users'),
        fetch('/api/reports/books')
      ]);

      if (loansRes.ok) setLoansData(await loansRes.json());
      if (usersRes.ok) setUsersData(await usersRes.json());
      if (booksRes.ok) setBooksData(await booksRes.json());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-xl">Carregando dados...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Dados para gráficos
  const loansPieData = loansData ? [
    { name: 'Uso Interno', value: loansData.summary.internalUse },
    { name: 'Externos', value: loansData.summary.external }
  ] : [];

  const roleData = usersData?.usersByRole.map((r: any) => ({
    name: r.role || 'Não definido',
    value: r.total
  })) || [];

  const areaData = booksData?.booksByArea.map((a: any) => ({
    name: a.area || 'Não definido',
    value: a.total
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gray-50 border-b-2 border-gray-200 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Ícones decorativos */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-library-purple/10 flex items-center justify-center">
                    <TrendingUp className="h-10 w-10 text-library-purple" />
                  </div>
                  <div className="h-20 w-20 rounded-2xl bg-cm-blue/10 flex items-center justify-center">
                    <Users className="h-10 w-10 text-cm-blue" />
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-8">
                  <div className="h-20 w-20 rounded-2xl bg-cm-orange/10 flex items-center justify-center">
                    <BarChart3 className="h-10 w-10 text-cm-orange" />
                  </div>
                  <div className="h-20 w-20 rounded-2xl bg-cm-green/10 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-cm-green" />
                  </div>
                </div>
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1">
                <h1 className="text-5xl font-bold mb-4 text-gray-800">Biblioteca em Dados</h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Acompanhe em tempo real os dados e estatísticas da biblioteca. 
                  Transparência e prestação de contas para toda a comunidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Seção de Empréstimos */}
        {loansData && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-cm-blue" />
                Empréstimos
              </h2>
              <p className="text-gray-600">Estatísticas sobre o uso do acervo</p>
            </div>

            {/* Cards de resumo - Empréstimos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className="rounded-xl border-l-4 border-l-blue-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{loansData.summary.total}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-l-4 border-l-green-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{loansData.summary.active}</div>
                      <div className="text-xs text-gray-600">Ativos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-l-4 border-l-purple-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{loansData.summary.returned}</div>
                      <div className="text-xs text-gray-600">Devolvidos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-l-4 border-l-red-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-red-600">{loansData.summary.overdue}</div>
                      <div className="text-xs text-gray-600">Em Atraso</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-l-4 border-l-orange-500">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold text-orange-500">{loansData.summary.internalUse}</div>
                      <div className="text-xs text-gray-600">Uso Interno</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-l-4 border-l-teal-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-teal-600" />
                    <div>
                      <div className="text-2xl font-bold text-teal-600">{loansData.summary.external}</div>
                      <div className="text-xs text-gray-600">Externos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Empréstimos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Empréstimos por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={loansData.loansByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="internal" fill="#F59E0B" name="Uso Interno" />
                      <Bar dataKey="external" fill="#1E40AF" name="Externos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Tipo de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={loansPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {loansPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Empréstimos por Dia da Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={loansData.loansByDayOfWeek}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day_name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#6B21A8" name="Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Livros mais emprestados - SEM nomes específicos, apenas contagem */}
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Livros Mais Emprestados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={loansData.topBooks.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="area" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="loan_count" fill="#16A34A" name="Empréstimos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Seção de Usuários */}
        {usersData && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Users className="h-8 w-8 text-cm-orange" />
                Usuários
              </h2>
              <p className="text-gray-600">Estatísticas sobre os usuários cadastrados</p>
            </div>

            {/* Cards de resumo - Usuários */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <Card className="rounded-xl border-l-4 border-l-blue-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{usersData.summary.total}</div>
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
                      <div className="text-2xl font-bold text-green-600">{usersData.summary.active}</div>
                      <div className="text-xs text-gray-600">Ativos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-l-4 border-l-gray-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{usersData.summary.inactive}</div>
                      <div className="text-xs text-gray-600">Inativos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Usuários */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Usuários por Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
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

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Novos Usuários por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usersData.newUsersByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={2} name="Novos Usuários" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Usuários por Turma</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usersData.usersByClass}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="class" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#6B21A8" name="Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Seção de Acervo */}
        {booksData && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-cm-green" />
                Acervo
              </h2>
              <p className="text-gray-600">Estatísticas sobre os livros da biblioteca</p>
            </div>

            {/* Cards de resumo - Acervo */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card className="rounded-xl border-l-4 border-l-blue-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{booksData.summary.total}</div>
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
                      <div className="text-2xl font-bold text-green-600">{booksData.summary.available}</div>
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
                      <div className="text-2xl font-bold text-orange-500">{booksData.summary.borrowed}</div>
                      <div className="text-xs text-gray-600">Emprestados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-l-4 border-l-purple-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{booksData.summary.reserved}</div>
                      <div className="text-xs text-gray-600">Reservados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-l-4 border-l-teal-600">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-teal-600" />
                    <div>
                      <div className="text-2xl font-bold text-teal-600">{booksData.summary.internalUse}</div>
                      <div className="text-xs text-gray-600">Uso Interno</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Acervo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Livros por Área</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={areaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {areaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Livros por Idioma</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={booksData.booksByLanguage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="language" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#16A34A" name="Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Nota sobre transparência */}
        <Card className="rounded-xl bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sobre este Portal</h3>
                <p className="text-gray-600 mb-3">
                  Este portal tem como objetivo promover a transparência na gestão da biblioteca, 
                  apresentando dados agregados e estatísticas sobre o uso do acervo, sem expor 
                  informações pessoais dos usuários.
                </p>
                <p className="text-gray-600">
                  Todos os dados são atualizados em tempo real e refletem o estado atual da biblioteca. 
                  No futuro, quando a biblioteca começar a receber doações, informações sobre os doadores 
                  e o destino dos recursos também serão publicadas aqui.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
