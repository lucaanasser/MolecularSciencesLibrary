import { Button } from "@/components/ui/button";

interface ActionBarProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  cancelColor?: string;
  loading?: boolean;
  showCancel?: boolean;
  showConfirm?: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Voltar",
  confirmColor = "bg-cm-green",
  cancelColor = "bg-gray-400",
  loading = false,
  showCancel = true,
  showConfirm = true,
}) => (
  <div className="grid grid-cols-2 gap-4 mt-6">
    {showCancel && (
      <Button
        type="button"
        variant="wide"
        className={cancelColor}
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
    )}
    <Button
      type="submit"
      variant="wide"
      className={confirmColor}
      disabled={loading}
      onClick={onConfirm}
    >
      {loading ? "Processando..." : confirmLabel}
    </Button>
  </div>
);

export default ActionBar;