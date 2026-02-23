/**
 * Drawer/modal para filtros em dispositivos móveis.
 *
 * Props:
 * - title (opcional): Título do drawer.
 * - loading (opcional): Exibe estado de carregamento.
 * - children: Conteúdo do drawer (normalmente FiltersList).
 */

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FiltersList, FiltersPanelProps } from ".";

export default function FiltersDrawer({
  title = "Filtros",
  props,
}: {
  title?: string;
  props: FiltersPanelProps
}) {  
  return (
    <>
      {props.drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end w-full">
          
          {/* Overlay */}
          <div
            className="fixed inset-0 z-0 bg-black bg-opacity-40"
            onClick={() => props.setDrawerOpen(false)}
            aria-label="Fechar filtros"
          />
          
          {/* Painel deslizante */}
          <div className="relative z-10 w-full bg-white rounded-t-lg shadow-lg p-6 animate-slide-up max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg">{title}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => props.setDrawerOpen(false)}
                aria-label="Fechar filtros"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <FiltersList {...props} />
          </div>

        </div>
      )}
    </>
  );
}