import { Button } from "@/components/ui/button";
import LoanForm from "@/features/loans/components/LoanForm";

const LoanRegister = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) => (
  <>
    <Button 
      variant="default" 
      className="mb-4 rounded-xl" 
      onClick={onBack}
    >
      Voltar
    </Button>
    <>
      <LoanForm isAdminMode={true} onSuccess={onSuccess} />
    </>
  </>
);

export default LoanRegister;
