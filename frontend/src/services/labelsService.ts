import { BookOption } from "@/features/books/types/book";

export async function downloadLabelsPdf(books: BookOption[], spineType: "normal" | "fina") {
  const response = await fetch("/labels/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ books, spineType })
  });
  if (!response.ok) throw new Error("Erro ao gerar PDF");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "etiquetas.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
