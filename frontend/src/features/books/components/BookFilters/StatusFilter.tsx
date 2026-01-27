import React from "react";
import { Checkbox } from "@/components/ui/checkbox";


interface StatusFilterProps {
  status: string[];
  setStatus: (value: string[]) => void;
}

const statusOptions = [
  { value: "reserved", label: "Reservado" },
  { value: "overdue", label: "Atrasado" },
  { value: "borrowed", label: "Emprestado" },
  { value: "extended", label: "Estendido" },
  { value: "available", label: "Disponível" },
];

const StatusFilter: React.FC<StatusFilterProps> = ({ status, setStatus }) => {
  const handleChange = (val: string) => {
    if (status.includes(val)) {
      setStatus(status.filter(s => s !== val));
    } else {
      setStatus([...status, val]);
    }
  };
  return (
    <div>
      <div className="font-semibold mb-1">Status</div>
      <div className="flex flex-col gap-1">
        {statusOptions.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={status.includes(opt.value)} onCheckedChange={() => handleChange(opt.value)} id={`status-${opt.value}`} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
