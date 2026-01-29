import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { DashboardSection, SummaryCard, ChartData } from "@/types/dashboard";

const COLORS = ['#6B21A8', '#1E40AF', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const colorClasses = {
  blue: 'border-l-blue-600 text-blue-600',
  green: 'border-l-green-600 text-green-600',
  purple: 'border-l-purple-600 text-purple-600',
  red: 'border-l-red-600 text-red-600',
  orange: 'border-l-orange-500 text-orange-500',
  teal: 'border-l-teal-600 text-teal-600',
  gray: 'border-l-gray-600 text-gray-600',
};

interface DashboardSectionProps {
  section: DashboardSection;
}

function SummaryCardComponent({ card }: { card: SummaryCard }) {
  const colorClass = colorClasses[card.color as keyof typeof colorClasses] || 'border-l-gray-600 text-gray-600';

  return (
    <Card className={`rounded-xl border-l-4 ${colorClass.split(' ')[0]}`}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <card.icon className={`h-5 w-5 ${colorClass.split(' ')[1]}`} />
          <div>
            <div className={`text-2xl font-bold ${colorClass.split(' ')[1]}`}>{card.value}</div>
            <div className="text-xs text-gray-600">{card.label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartComponent({ chart }: { chart: ChartData }) {
  const colors = chart.colors || COLORS;

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={chart.dataKey || 'value'} fill={colors[0]} name={chart.name || 'Valor'} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={chart.dataKey || 'value'}
            >
              {chart.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      case 'line':
        return (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={chart.dataKey || 'value'} stroke={colors[0]} strokeWidth={2} name={chart.name || 'Valor'} />
          </LineChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>{chart.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function DashboardSectionComponent({ section }: DashboardSectionProps) {
  const summaryCols = section.summaryGridCols || 3;
  const chartCols = section.chartsGridCols || 2;

  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      default: return 'grid-cols-3';
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <section.icon className="h-8 w-8 text-gray-600" />
          {section.title}
        </h2>
        <p className="text-gray-600">{section.description}</p>
      </div>

      {/* Cards de resumo */}
      <div className={`grid grid-cols-2 md:${getGridColsClass(summaryCols)} gap-4 mb-8`}>
        {section.summaryCards.map((card, index) => (
          <SummaryCardComponent key={index} card={card} />
        ))}
      </div>

      {/* Gráficos */}
      <div className={`grid grid-cols-1 lg:${getGridColsClass(chartCols)} gap-6`}>
        {section.charts.map((chart, index) => (
          <ChartComponent key={index} chart={chart} />
        ))}
      </div>
    </section>
  );
}