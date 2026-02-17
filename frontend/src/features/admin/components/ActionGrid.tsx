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

const ActionGrid: React.FC<ActionGridProps> = ({ actions, className = "", columns = 3 }) => {
  const gridColsMap = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };
  const gridColsClass = gridColsMap[columns] || "md:grid-cols-3";
  return (
  <div className={`grid grid-cols-1 ${gridColsClass} gap-4 ${className}`}>
    {actions.map(({ label, onClick, color, icon, disabled }, i) => (
      <Button
        key={label}
        variant="wide"
        size="default"
        className={color}
        onClick={onClick}
        disabled={disabled}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </Button>
    ))}
  </div>
)};

export default ActionGrid;