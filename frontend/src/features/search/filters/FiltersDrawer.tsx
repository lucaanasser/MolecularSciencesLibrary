import React from "react";
import { Button } from "@/components/ui/button";
import { X, Filter as FilterIcon } from "lucide-react";
import { FilterPanel } from "@/features/search/filters/FilterPanel";
import { FilterProps } from "@/features/search/filters/Filter";

/**
 * Drawer genérico para filtros reutilizáveis
 */
export const FiltersDrawer: React.FC<FilterProps> = ({
  title = "Filtros",
  groups,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}>
        <FilterIcon className="w-5 h-5 flex items-center justify-center" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end w-full">
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-0 bg-black bg-opacity-40" 
            onClick={() => setOpen(false)} 
          />
          {/* Painel deslizante */}
          <div className="z-10 w-full min-h-[20vh] overflow-y-auto rounded-t-2xl bg-white transition-transform duration-300 ease-in-out animate-in slide-in-from-bottom">
            <div className="content-container flex flex-col">
              { /* Header */ }
              <div className="flex items-center justify-between mb-4">
                <h3 className="mb-0">{title}</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="flex items-center justify-center"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <FilterPanel groups={groups} className="" />
              <div className="mt-6">
                <Button 
                  variant="wide" 
                  className="flex-1 rounded-2xl" 
                  onClick={() => setOpen(false)}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FiltersDrawer;
