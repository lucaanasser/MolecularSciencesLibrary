import { useState } from "react";
import ActionGrid from "@/features/admin/components/ActionGrid";
import LoanRulesForm from "@/features/admin/features/settings/features/LoanRulesForm";
import LoanRulesView from "@/features/admin/features/settings/features/LoanRulesView";

const Settings = () => {
  // Log de início de renderização das configurações
  console.log("🔵 [AdminPage/Settings] Renderizando configurações");
  const [showRulesForm, setShowRulesForm] = useState(false);
  return (
    <>
      <h3>Configurações</h3>
        <div className="mb-6">
          {showRulesForm ? (
            <>
              <LoanRulesForm onSuccess={() => setShowRulesForm(false)} onCancel={() => setShowRulesForm(false)} />
            </>
          ) : (
            <>
              <LoanRulesView onEdit={() => setShowRulesForm(true)} />
            </>
          )}
        </div>
    </>
  );
};

export default Settings;
