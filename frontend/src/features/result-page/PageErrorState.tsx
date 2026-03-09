import React from "react";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageErrorStateProps {
  message?: string;
  onBack?: () => void;
}

const PageErrorState: React.FC<PageErrorStateProps> = ({
  message = "Ocorreu um erro",
  onBack,
}) => (
  <div className="min-h-screen flex flex-col">
    <div className="flex-grow flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <p className="text-gray-600">{message}</p>
      {onBack && (
        <Button onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      )}
    </div>
  </div>
);

export default PageErrorState;
