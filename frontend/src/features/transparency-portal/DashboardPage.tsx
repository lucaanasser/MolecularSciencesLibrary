import { useState, useEffect } from 'react';
import { LucideIcon } from "lucide-react";
import DashboardSectionComponent from "@/features/transparency-portal/DashboardSection";
import { DashboardConfig } from "@/types/dashboard";

interface DashboardPageProps {
  config: DashboardConfig;
  fetchData: () => Promise<any>;
  loadingMessage?: string;
}

export default function DashboardPage({ config, fetchData, loadingMessage = "Carregando dados..." }: DashboardPageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchData();
      setData(result);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-xl">{loadingMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b-2 border-gray-200 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Ícones decorativos */}
              <div className="flex gap-4">
                {config.heroIcons.map((Icon, index) => (
                  <div key={index} className="flex flex-col gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-library-purple/10 flex items-center justify-center">
                      <Icon className="h-10 w-10 text-library-purple" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <h1 className="text-5xl font-bold mb-4 text-gray-800">{config.title}</h1>
                <p className="text-xl text-gray-600 leading-relaxed">{config.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {config.sections.map((section) => (
          data && (
            <DashboardSectionComponent key={section.id} section={section} />
          )
        ))}
      </div>
    </div>
  );
}