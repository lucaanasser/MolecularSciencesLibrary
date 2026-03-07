import React from "react";
import { FieldConfig } from "../search";
import { searchProps, filtersProps } from ".";
import { BooksService } from "@/services/BooksService";

const statusConfig: Record<string, { label: string; className: string }> = {
  "disponível":   { label: "Disponível",   className: "text-green-600" },
  "emprestado":   { label: "Emprestado",   className: "text-amber-600" },
  "atrasado":     { label: "Atrasado",     className: "text-red-600" },
  "reservado":    { label: "Reservado",    className: "text-purple-600" },
  "indisponível": { label: "Indisponível", className: "text-gray-500" },
};

// Campos do resultado
const resultsFields: FieldConfig[] = [
  { key: "title", type: "main", linkTo: (result) => `/biblioteca/livro/${result.code}`},
  { key: "subtitle", type: "main" },
  { key: "code", type: "secondary" },
  { key: "authors", type: "secondary", className: "text-gray-600" },
  {
    key: "display_status",
    type: "secondary",
    render: (value) => {
      const cfg = statusConfig[value] ?? { label: value, className: "text-gray-500" };
      return <span className={`font-medium ${cfg.className}`}>{cfg.label}</span>;
    },
  },
];

const searchResultsProps = {
  resultsService: (query: string, filters: any) => BooksService.searchBooks({q: query, ...filters}),
  filterGroupsConfig: filtersProps,
  resultsFields,
  searchProps,
};

export default searchResultsProps;