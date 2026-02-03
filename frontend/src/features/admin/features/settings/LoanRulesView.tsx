import { useLoanRules } from "@/features/rules/hooks/useLoanRules";
import { loanRulesFields } from "./loanRulesFields";
import ActionBar from "@/features/admin/components/ActionBar";

interface LoanRulesViewProps {
  onEdit?: () => void;
}

export default function LoanRulesView({ onEdit }: LoanRulesViewProps) {
  const { rules, loading, error } = useLoanRules();

  if (loading) return <div>Carregando regras...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!rules) return null;

    return (
      <div>
        <ul className="flex flex-col gap-3 mb-4 prose-md">
          {loanRulesFields.map(field => (
            <li key={field.name} className="flex items-center gap-2">
              <span>{field.label}:</span>
              <b>{rules[field.name]} {field.unit}</b>
            </li>
          ))}
        </ul>
        <ActionBar
          showCancel={false}
          onConfirm={onEdit}
          confirmLabel="Editar Regras"
          confirmColor="bg-library-purple"
        />
      </div>
    );
}
