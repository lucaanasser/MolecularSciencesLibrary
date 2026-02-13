import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React from "react";

interface Pessoa {
  id: number;
  nome: string;
  turma: string;
  avatar: string | null;
}

interface FollowingButtonPopoverProps {
  seguindo: Pessoa[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FollowingButtonPopover: React.FC<FollowingButtonPopoverProps> = ({ seguindo, open, onOpenChange }) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <button className="relative group p-2 rounded-full bg-gray-200 text-gray-600 hover:primary-bg hover:text-white transition-colors flex items-center justify-center">
        <Users className="w-4 h-4" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center primary-bg text-white text-xs">
          {seguindo.length}
        </span>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-14 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">Seguindo</span>
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-64 p-0" align="start">
      <div className="p-3 border-b border-gray-100">
        <h4 className="font-semibold text-sm text-gray-900">Seguindo</h4>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {seguindo.map((pessoa) => (
          <div key={pessoa.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
            <Avatar className="w-8 h-8">
              {pessoa.avatar ? (
                <AvatarImage src={pessoa.avatar} alt={pessoa.nome} />
              ) : null}
              <AvatarFallback className="bg-cm-blue text-white text-xs">
                {pessoa.nome?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{pessoa.nome}</p>
              <p className="text-xs text-gray-500">{pessoa.turma}</p>
            </div>
          </div>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);
