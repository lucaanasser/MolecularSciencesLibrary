import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoanRulesForm from "@/features/rules/components/LoanRulesForm";
import LoanRulesView from "@/features/rules/components/LoanRulesView";

const Settings = () => {
  // Log de início de renderização das configurações
  console.log("🔵 [AdminPage/Settings] Renderizando configurações");
  const [showRulesForm, setShowRulesForm] = useState(false);
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Configurações</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Regras de Empréstimo</CardTitle>
          </CardHeader>
          <CardContent>
            {showRulesForm ? (
              <>
                <LoanRulesForm onSuccess={() => setShowRulesForm(false)} />
                <Button variant="default" className="mt-4 w-full text-sm sm:text-base" onClick={() => setShowRulesForm(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <LoanRulesView />
                <Button className="w-full bg-cm-blue hover:bg-cm-blue/90 mt-4 text-sm sm:text-base" onClick={() => setShowRulesForm(true)}>
                  Editar Regras
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
