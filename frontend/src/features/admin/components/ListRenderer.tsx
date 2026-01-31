import { ReactNode } from "react";
import ActionBar from "@/features/admin/components/ActionBar";

type Column<T> = {
  label: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  render?: (row: T) => ReactNode;
};

interface AdminListContainerProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: ReactNode | string;
  emptyMessage?: ReactNode | string;
  footer?: ReactNode;
  onBack?: () => void;
}

/*
 * Container reutilizável para renderizar listas na AdminPage.
 */

function AdminListContainer<T = any>({
  data,
  columns,
  loading = false,
  error,
  emptyMessage = "Nenhum item encontrado.",
  footer,
  onBack = () => window.history.back(),
} : AdminListContainerProps<T>) {
  return (
    <>
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p className="text-cm-red">{error}</p>
      ) : !data || data.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <>
        <div className="overflow-x-auto rounded-t-xl border border-gray-200">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-3 py-2 border-b text-sm ${col.className || ''}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col, j) => (
                    <td key={j} className={`px-3 py-2 border-b text-sm ${col.className || ''}`}>
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row as any)[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {footer && 
          <p className="rounded-b-xl px-4 py-2 bg-gray-200 border-t text-sm font-semibold">
            {footer}
          </p>
        }
        </>
      )}
      <ActionBar
        onCancel={onBack}
        showCancel={true}
        showConfirm={false}
        cancelLabel="Voltar"
      />
    </>
  );
}

export type { Column };
export default AdminListContainer;