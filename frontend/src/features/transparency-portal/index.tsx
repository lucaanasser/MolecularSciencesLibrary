import { useState, useEffect } from 'react';
import DashboardPage from "@/features/transparency-portal/DashboardPage";
import { DashboardConfig } from "@/types/dashboard";
import { BookOpen, BookMarked, BookX, Users, UserCheck, TrendingUp, Clock, BarChart3 } from "lucide-react";

const transparencyConfig: DashboardConfig = {
  title: "Biblioteca em Dados",
  subtitle: "Acompanhe em tempo real os dados e estatísticas da biblioteca. Transparência e prestação de contas para toda a comunidade.",
  heroIcons: [TrendingUp, Users, BarChart3, BookOpen],
  sections: [
    {
      id: 'loans',
      title: 'Empréstimos',
      icon: TrendingUp,
      description: 'Estatísticas sobre o uso do acervo',
      summaryGridCols: 6,
      chartsGridCols: 2,
      summaryCards: [
        { icon: TrendingUp, value: 0, label: 'Total', color: 'blue' },
        { icon: Clock, value: 0, label: 'Ativos', color: 'green' },
        { icon: BookMarked, value: 0, label: 'Devolvidos', color: 'purple' },
        { icon: Clock, value: 0, label: 'Em Atraso', color: 'red' },
        { icon: BookOpen, value: 0, label: 'Uso Interno', color: 'orange' },
        { icon: Users, value: 0, label: 'Externos', color: 'teal' },
      ],
      charts: [
        {
          type: 'bar',
          title: 'Empréstimos por Mês',
          data: [],
          dataKey: 'internal',
          xAxisKey: 'month',
          colors: ['#F59E0B', '#1E40AF'],
          name: 'Uso Interno'
        },
        {
          type: 'pie',
          title: 'Tipo de Uso',
          data: [],
          dataKey: 'value'
        },
        {
          type: 'bar',
          title: 'Empréstimos por Dia da Semana',
          data: [],
          dataKey: 'total',
          xAxisKey: 'day_name',
          colors: ['#6B21A8']
        },
        {
          type: 'bar',
          title: 'Livros Mais Emprestados',
          data: [],
          dataKey: 'loan_count',
          xAxisKey: 'area',
          colors: ['#16A34A']
        }
      ]
    },
    {
      id: 'users',
      title: 'Usuários',
      icon: Users,
      description: 'Estatísticas sobre os usuários cadastrados',
      summaryGridCols: 3,
      chartsGridCols: 2,
      summaryCards: [
        { icon: Users, value: 0, label: 'Total', color: 'blue' },
        { icon: UserCheck, value: 0, label: 'Ativos', color: 'green' },
        { icon: Users, value: 0, label: 'Inativos', color: 'gray' },
      ],
      charts: [
        {
          type: 'pie',
          title: 'Usuários por Perfil',
          data: [],
          dataKey: 'value'
        },
        {
          type: 'line',
          title: 'Novos Usuários por Mês',
          data: [],
          dataKey: 'total',
          xAxisKey: 'month',
          colors: ['#F59E0B']
        },
        {
          type: 'bar',
          title: 'Usuários por Turma',
          data: [],
          dataKey: 'total',
          xAxisKey: 'class',
          colors: ['#6B21A8']
        }
      ]
    },
    {
      id: 'books',
      title: 'Acervo',
      icon: BookOpen,
      description: 'Estatísticas sobre os livros da biblioteca',
      summaryGridCols: 5,
      chartsGridCols: 2,
      summaryCards: [
        { icon: BookOpen, value: 0, label: 'Total', color: 'blue' },
        { icon: BookMarked, value: 0, label: 'Disponíveis', color: 'green' },
        { icon: BookX, value: 0, label: 'Emprestados', color: 'orange' },
        { icon: Clock, value: 0, label: 'Reservados', color: 'purple' },
        { icon: BookOpen, value: 0, label: 'Uso Interno', color: 'teal' },
      ],
      charts: [
        {
          type: 'pie',
          title: 'Livros por Área',
          data: [],
          dataKey: 'value'
        },
        {
          type: 'bar',
          title: 'Livros por Idioma',
          data: [],
          dataKey: 'total',
          xAxisKey: 'language',
          colors: ['#16A34A']
        }
      ]
    }
  ]
};

async function fetchTransparencyData() {
  const [loansRes, usersRes, booksRes] = await Promise.all([
    fetch('/api/reports/loans'),
    fetch('/api/reports/users'),
    fetch('/api/reports/books')
  ]);

  const loansData = loansRes.ok ? await loansRes.json() : null;
  const usersData = usersRes.ok ? await usersRes.json() : null;
  const booksData = booksRes.ok ? await booksRes.json() : null;

  return { loansData, usersData, booksData };
}

export default function TransparencyPortalFeature() {
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    const result = await fetchTransparencyData();
    setData(result);
    return result;
  };

  // Atualizar a configuração com os dados reais
  const configWithData = {
    ...transparencyConfig,
    sections: transparencyConfig.sections.map(section => {
      if (section.id === 'loans' && data?.loansData) {
        return {
          ...section,
          summaryCards: section.summaryCards.map((card, index) => ({
            ...card,
            value: Object.values(data.loansData.summary)[index] as number
          })),
          charts: section.charts.map((chart, index) => {
            let chartData = [];
            if (index === 0) chartData = data.loansData.loansByMonth;
            else if (index === 1) chartData = [
              { name: 'Uso Interno', value: data.loansData.summary.internalUse },
              { name: 'Externos', value: data.loansData.summary.external }
            ];
            else if (index === 2) chartData = data.loansData.loansByDayOfWeek;
            else if (index === 3) chartData = data.loansData.topBooks.slice(0, 10);

            return { ...chart, data: chartData };
          })
        };
      } else if (section.id === 'users' && data?.usersData) {
        return {
          ...section,
          summaryCards: section.summaryCards.map((card, index) => ({
            ...card,
            value: Object.values(data.usersData.summary)[index] as number
          })),
          charts: section.charts.map((chart, index) => {
            let chartData = [];
            if (index === 0) chartData = data.usersData.usersByRole.map((r: any) => ({
              name: r.role || 'Não definido',
              value: r.total
            }));
            else if (index === 1) chartData = data.usersData.newUsersByMonth;
            else if (index === 2) chartData = data.usersData.usersByClass;

            return { ...chart, data: chartData };
          })
        };
      } else if (section.id === 'books' && data?.booksData) {
        return {
          ...section,
          summaryCards: section.summaryCards.map((card, index) => ({
            ...card,
            value: Object.values(data.booksData.summary)[index] as number
          })),
          charts: section.charts.map((chart, index) => {
            let chartData = [];
            if (index === 0) chartData = data.booksData.booksByArea.map((a: any) => ({
              name: a.area || 'Não definido',
              value: a.total
            }));
            else if (index === 1) chartData = data.booksData.booksByLanguage;

            return { ...chart, data: chartData };
          })
        };
      }
      return section;
    })
  };

  return (
    <DashboardPage
      config={configWithData}
      fetchData={fetchData}
      loadingMessage="Carregando dados da biblioteca..."
    />
  );
}