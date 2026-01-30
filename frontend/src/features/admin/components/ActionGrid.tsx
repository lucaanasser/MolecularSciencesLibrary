import { Button } from "@/components/ui/button";

interface Action {
  label: string;
  onClick: () => void;
  color?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ActionGridProps {
  actions: Action[];
  className?: string;
  columns?: number;
}

const ActionGrid: React.FC<ActionGridProps> = ({ actions, className = "", columns = 3 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4 ${className}`}>
    {actions.map(({ label, onClick, color, icon, disabled }, i) => (
      <Button
        key={label}
        variant="wide"
        size="sm"
        className={color}
        onClick={onClick}
        disabled={disabled}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </Button>
    ))}
  </div>
);

export default ActionGrid;