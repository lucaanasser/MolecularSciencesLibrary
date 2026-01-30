import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoansReportView, UsersReportView, BooksReportView, DonatorsReportView, CompleteReportCard } from '@/features/reports/components';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  console.log("🔵 [AdminPage/Reports] Renderizando relatórios");

  const handleBack = () => setSelectedReport(null);

  // Se um relatório foi selecionado, mostrar a view correspondente
  if (selectedReport) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <Button variant="default" onClick={handleBack} className="mb-4">
          ← Voltar
        </Button>
        {selectedReport === 'loans' && <LoansReportView />}
        {selectedReport === 'users' && <UsersReportView />}
        {selectedReport === 'books' && <BooksReportView />}
        {selectedReport === 'donators' && <DonatorsReportView />}
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Relatórios</h2>
      <p className="text-sm sm:text-base text-gray-600">Visualize estatísticas e relatórios sobre o uso da biblioteca.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <Card 
          className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedReport('loans')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-blue hover:bg-cm-blue/90 text-sm sm:text-base">Visualizar</Button>
          </CardContent>
        </Card>
        <Card 
          className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedReport('users')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-orange hover:bg-cm-orange/90 text-sm sm:text-base">Visualizar</Button>
          </CardContent>
        </Card>
        <Card 
          className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedReport('books')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Acervo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-green hover:bg-cm-green/90 text-sm sm:text-base">Visualizar</Button>
          </CardContent>
        </Card>
        <Card 
          className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedReport('donators')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Doadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base">Visualizar</Button>
          </CardContent>
        </Card>
        <CompleteReportCard />
      </div>
    </div>
  );
};

export default Reports;
