import DashboardPage from "@/features/transparency-portal/DashboardPage";
import { logger } from "@/utils/logger";
import { DashboardConfig } from "@/types/dashboard";
import { BookOpen, BookMarked, BookX, Users, UserCheck, TrendingUp, Clock, BarChart3 } from "lucide-react";

// Dados mockados para simulação
const mockLoansData = {
  summary: {
    total: 1250,
    active: 89,
    returned: 1123,
    overdue: 12,
    internalUse: 856,
    external: 394
  },
  loansByMonth: [
    { month: 'Jan', internal: 45, external: 23 },
    { month: 'Fev', internal: 52, external: 31 },
    { month: 'Mar', internal: 48, external: 28 },
    { month: 'Abr', internal: 61, external: 35 },
    { month: 'Mai', internal: 58, external: 42 },
    { month: 'Jun', internal: 67, external: 38 }
  ],
  loansByDayOfWeek: [
    { day_name: 'Seg', total: 45 },
    { day_name: 'Ter', total: 52 },
    { day_name: 'Qua', total: 48 },
    { day_name: 'Qui', total: 61 },
    { day_name: 'Sex', total: 58 },
    { day_name: 'Sáb', total: 12 },
    { day_name: 'Dom', total: 8 }
  ],
  topBooks: [
    { area: 'Matemática', loan_count: 45 },
    { area: 'Física', loan_count: 38 },
    { area: 'Química', loan_count: 52 },
    { area: 'Biologia', loan_count: 41 },
    { area: 'Engenharia', loan_count: 35 }
  ]
};

const mockUsersData = {
  summary: {
    total: 234,
    active: 198,
    inactive: 36
  },
  usersByRole: [
    { role: 'Estudante', total: 156 },
    { role: 'Professor', total: 45 },
    { role: 'Funcionário', total: 23 },
    { role: 'Visitante', total: 10 }
  ],
  newUsersByMonth: [
    { month: 'Jan', total: 12 },
    { month: 'Fev', total: 8 },
    { month: 'Mar', total: 15 },
    { month: 'Abr', total: 22 },
    { month: 'Mai', total: 18 },
    { month: 'Jun', total: 25 }
  ],
  usersByClass: [
    { class: '1º Ano', total: 45 },
    { class: '2º Ano', total: 52 },
    { class: '3º Ano', total: 38 },
    { class: '4º Ano', total: 41 },
    { class: '5º Ano', total: 29 }
  ]
};

const mockBooksData = {
  summary: {
    total: 3456,
    available: 2890,
    borrowed: 456,
    reserved: 67,
    internalUse: 43
  },
  booksByArea: [
    { area: 'Matemática', total: 456 },
    { area: 'Física', total: 389 },
    { area: 'Química', total: 523 },
    { area: 'Biologia', total: 412 },
    { area: 'Engenharia', total: 678 },
    { area: 'Computação', total: 345 }
  ],
  booksByLanguage: [
    { language: 'Português', total: 2345 },
    { language: 'Inglês', total: 789 },
    { language: 'Espanhol', total: 156 },
    { language: 'Francês', total: 89 },
    { language: 'Alemão', total: 77 }
  ]
};

// Configuração mockada baseada na página de transparência
const mockConfig: DashboardConfig = {
  title: "Biblioteca em Dados - MOCK",
  subtitle: "Dados simulados para teste e desenvolvimento. Acompanhe em tempo real os dados e estatísticas da biblioteca.",
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
        { icon: TrendingUp, value: mockLoansData.summary.total, label: 'Total', color: 'blue' },
        { icon: Clock, value: mockLoansData.summary.active, label: 'Ativos', color: 'green' },
        { icon: BookMarked, value: mockLoansData.summary.returned, label: 'Devolvidos', color: 'purple' },
        { icon: Clock, value: mockLoansData.summary.overdue, label: 'Em Atraso', color: 'red' },
        { icon: BookOpen, value: mockLoansData.summary.internalUse, label: 'Uso Interno', color: 'orange' },
        { icon: Users, value: mockLoansData.summary.external, label: 'Externos', color: 'teal' },
      ],
      charts: [
        {
          type: 'bar',
          title: 'Empréstimos por Mês',
          data: mockLoansData.loansByMonth,
          dataKey: 'internal',
          xAxisKey: 'month',
          colors: ['#F59E0B', '#1E40AF'],
          name: 'Uso Interno'
        },
        {
          type: 'pie',
          title: 'Tipo de Uso',
          data: [
            { name: 'Uso Interno', value: mockLoansData.summary.internalUse },
            { name: 'Externos', value: mockLoansData.summary.external }
          ],
          dataKey: 'value'
        },
        {
          type: 'bar',
          title: 'Empréstimos por Dia da Semana',
          data: mockLoansData.loansByDayOfWeek,
          dataKey: 'total',
          xAxisKey: 'day_name',
          colors: ['#6B21A8']
        },
        {
          type: 'bar',
          title: 'Livros Mais Emprestados',
          data: mockLoansData.topBooks,
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
        { icon: Users, value: mockUsersData.summary.total, label: 'Total', color: 'blue' },
        { icon: UserCheck, value: mockUsersData.summary.active, label: 'Ativos', color: 'green' },
        { icon: Users, value: mockUsersData.summary.inactive, label: 'Inativos', color: 'gray' },
      ],
      charts: [
        {
          type: 'pie',
          title: 'Usuários por Perfil',
          data: mockUsersData.usersByRole.map(r => ({ name: r.role, value: r.total })),
          dataKey: 'value'
        },
        {
          type: 'line',
          title: 'Novos Usuários por Mês',
          data: mockUsersData.newUsersByMonth,
          dataKey: 'total',
          xAxisKey: 'month',
          colors: ['#F59E0B']
        },
        {
          type: 'bar',
          title: 'Usuários por Turma',
          data: mockUsersData.usersByClass,
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
        { icon: BookOpen, value: mockBooksData.summary.total, label: 'Total', color: 'blue' },
        { icon: BookMarked, value: mockBooksData.summary.available, label: 'Disponíveis', color: 'green' },
        { icon: BookX, value: mockBooksData.summary.borrowed, label: 'Emprestados', color: 'orange' },
        { icon: Clock, value: mockBooksData.summary.reserved, label: 'Reservados', color: 'purple' },
        { icon: BookOpen, value: mockBooksData.summary.internalUse, label: 'Uso Interno', color: 'teal' },
      ],
      charts: [
        {
          type: 'pie',
          title: 'Livros por Área',
          data: mockBooksData.booksByArea.map(a => ({ name: a.area, value: a.total })),
          dataKey: 'value'
        },
        {
          type: 'bar',
          title: 'Livros por Idioma',
          data: mockBooksData.booksByLanguage,
          dataKey: 'total',
          xAxisKey: 'language',
          colors: ['#16A34A']
        }
      ]
    }
  ]
};

// Função mockada que simula o fetch de dados
const mockFetchData = async () => {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    loansData: mockLoansData,
    usersData: mockUsersData,
    booksData: mockBooksData
  };
};

// Função que atualiza a configuração com dados mockados
const getMockConfig = (): DashboardConfig => {
  return {
    ...mockConfig,
    sections: mockConfig.sections.map(section => {
      if (section.id === 'loans') {
        return {
          ...section,
          summaryCards: section.summaryCards.map(card => ({ ...card, value: mockLoansData.summary[card.label.toLowerCase() as keyof typeof mockLoansData.summary] || card.value })),
          charts: section.charts.map(chart => {
            if (chart.title === 'Empréstimos por Mês') return { ...chart, data: mockLoansData.loansByMonth };
            if (chart.title === 'Tipo de Uso') return { ...chart, data: [{ name: 'Uso Interno', value: mockLoansData.summary.internalUse }, { name: 'Externos', value: mockLoansData.summary.external }] };
            if (chart.title === 'Empréstimos por Dia da Semana') return { ...chart, data: mockLoansData.loansByDayOfWeek };
            if (chart.title === 'Livros Mais Emprestados') return { ...chart, data: mockLoansData.topBooks };
            return chart;
          })
        };
      } else if (section.id === 'users') {
        return {
          ...section,
          summaryCards: section.summaryCards.map(card => ({ ...card, value: mockUsersData.summary[card.label.toLowerCase() as keyof typeof mockUsersData.summary] || card.value })),
          charts: section.charts.map(chart => {
            if (chart.title === 'Usuários por Perfil') return { ...chart, data: mockUsersData.usersByRole.map(r => ({ name: r.role, value: r.total })) };
            if (chart.title === 'Novos Usuários por Mês') return { ...chart, data: mockUsersData.newUsersByMonth };
            if (chart.title === 'Usuários por Turma') return { ...chart, data: mockUsersData.usersByClass };
            return chart;
          })
        };
      } else if (section.id === 'books') {
        return {
          ...section,
          summaryCards: section.summaryCards.map(card => ({ ...card, value: mockBooksData.summary[card.label.toLowerCase() as keyof typeof mockBooksData.summary] || card.value })),
          charts: section.charts.map(chart => {
            if (chart.title === 'Livros por Área') return { ...chart, data: mockBooksData.booksByArea.map(a => ({ name: a.area, value: a.total })) };
            if (chart.title === 'Livros por Idioma') return { ...chart, data: mockBooksData.booksByLanguage };
            return chart;
          })
        };
      }
      return section;
    })
  };
};

const TestPage = () => {
  return (
    <div className="content-container">
      <DashboardPage
        config={getMockConfig()}
        fetchData={mockFetchData}
        loadingMessage="Carregando dados mockados..."
      />
    </div>
  );
};

export default TestPage;