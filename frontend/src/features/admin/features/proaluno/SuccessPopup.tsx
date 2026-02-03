import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/**
 * Popup de sucesso genérico para empréstimos e devoluções.
 * Exibe as informações da operação confirmada usando AlertDialog.
 */

interface SuccessPopupProps {
  type: "emprestimo" | "devolucao";
  codigoLivro: string;
  nusp?: string;
  loanDetails?: any;
  onClose: () => void;
}

export const SuccessPopup = ({ type, codigoLivro, nusp, loanDetails, onClose }: SuccessPopupProps) => {
  const isLoan = type === "emprestimo";
  
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-cm-green">
            {isLoan ? "Empréstimo Confirmado!" : "Devolução Confirmada!"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {isLoan && nusp && (
                <div>
                  <strong>NUSP:</strong> {nusp}
                </div>
              )}
              
              <div>
                <strong>Código do Livro:</strong> {codigoLivro}
              </div>
              
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="bg-gray-400">
            Fechar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
