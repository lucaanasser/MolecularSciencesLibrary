import React from "react";
import { Button } from "@/components/ui/button";
import ImportDonatorsCSV from "@/features/donators/components/ImportDonatorsCSV";

interface ImportDonatorsProps {
  onBack: () => void;
  onCancel: () => void;
  onSuccess: (results: any) => void;
  onError: (err: Error) => void;
}

const ImportDonators: React.FC<ImportDonatorsProps> = ({ onBack, onCancel, onSuccess, onError }) => (
  <div className="mt-6">
    <Button 
      variant="default" 
      className="mb-4 rounded-xl" 
      onClick={onBack}
    >
      Voltar
    </Button>
    <div className="rounded-xl shadow-sm bg-white p-4">
      <ImportDonatorsCSV
        onCancel={onCancel}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  </div>
);

export default ImportDonators;
