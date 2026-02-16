import { useEffect, useState } from "react";
import { LOAN_RULES, LOAN_RULES_META } from "@/constants/loan_rules";
import { RulesService } from "@/services/RulesService";
import ActionBar from "@/features/admin/components/ActionBar";


export default function LoanRulesView({ onEdit, onError}: { onEdit: () => void, onError: (err: any) => void }) {
  const [rules, setRules] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    RulesService.getRules()
      .then((data) => {
        setRules(data);
        setLoading(false);
      })
      .catch((err) => {
        onError(err)
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center my-8">Carregando regras...</div>;

  return (
    <div>
      <p>Essas são as regras de empréstimo atuais do sistema.</p>
      <div className="overflow-x-auto">
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Regra</th>
                <th className="px-4 py-2 text-left">Valor</th>
                <th className="px-4 py-2 text-left">Unidade</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {LOAN_RULES.map((field) => (
                <tr key={field} className="border-t">
                  <td className="px-4 py-2 font-medium">
                    {LOAN_RULES_META[field]?.label || field}
                  </td>
                  <td className="px-4 py-2">{rules[field]}</td>
                  <td className="px-4 py-2">{LOAN_RULES_META[field]?.unit || ""}</td>
                  <td className="px-2 py-2">
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ActionBar
        showCancel={false}
        onConfirm={onEdit}
        confirmLabel="Editar Regras"
        confirmColor="bg-cm-green"
      />
    </div>
  );
}
