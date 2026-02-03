import LoanActive from "@/features/loans/components/LoanActive";
import LoanHistoryOnly from "@/features/loans/components/LoanHistoryOnly";

export default function TestPage() {
  return (
    <div className="content-container">
    <LoanActive userId={3} />
    <LoanHistoryOnly userId={3} />
    </div>
  );
}