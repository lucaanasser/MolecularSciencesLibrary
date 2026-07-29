/**
 * Utilitarios de CSV do Worker.
 * Espelho de backend/src/shared/csv/csvUtils.js (escapeCSV/parseCSVLine/importFromCSV)
 * adaptado ao runtime dos Workers:
 *  - upload multipart via FormData nativo, no lugar do multer;
 *  - o parse/validacao de TODAS as linhas acontece em memoria, antes de tocar o banco;
 *  - a escrita vai em lotes com db.batch(), porque cada query D1 conta como subrequest
 *    e o plano free permite 50 por invocacao — um INSERT por linha (como no Express)
 *    estouraria o limite em qualquer arquivo com poucas dezenas de linhas.
 * Contrato de resposta preservado: { success, failed, errors: [{ row, error, data }] }.
 */
import type { Context } from 'hono';
import { batch, run } from './db';

export type CsvRow = Record<string, string>;
export type ImportError = { row: number; error: string; data?: string };
export type ImportResults = { success: number; failed: number; errors: ImportError[] };
export type MappedRow<T> = { row: number; entity: T };
export type InsertedRow<T> = MappedRow<T> & { id: number };
export type Statement = { sql: string; params: unknown[] };

/** Escapa valores para CSV (adiciona aspas se necessario). Identico ao Express. */
export function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/** Parse simples de linha CSV (considera aspas). Identico ao Express. */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/** Corpo do arquivo exportado: BOM + cabecalho + linhas, como o Express. */
export function csvBody(headers: string[], rows: string[][]): string {
  return `﻿${[headers.join(','), ...rows.map((row) => row.join(','))].join('\n')}`;
}

/** Resposta de download com os mesmos headers do Express. */
export function csvDownload(c: Context, filename: string, content: string): Response {
  return c.body(content, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`
  });
}

/** Nome de arquivo com a data de hoje, no formato usado pelos services do Express. */
export const datedFilename = (prefix: string): string =>
  `${prefix}_${new Date().toISOString().split('T')[0]}.csv`;

type UploadedFile = { text(): Promise<string> };

const isFile = (value: unknown): value is UploadedFile =>
  typeof value === 'object' && value !== null && typeof (value as UploadedFile).text === 'function';

/**
 * Le o arquivo enviado no multipart (campo 'csvFile', como o multer do Express;
 * 'file' e aceito por compatibilidade com chamadas antigas do frontend).
 * Devolve null quando nao ha arquivo — o chamador responde 400 como o Express.
 */
export async function csvUpload(c: Context): Promise<string | null> {
  const contentType = c.req.header('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) return null;

  const body = await c.req.parseBody().catch(() => null);
  if (!body) return null;

  const uploaded = body['csvFile'] ?? body['file'];
  if (!isFile(uploaded)) return null;

  return uploaded.text();
}

/**
 * Espelho do laco de importFromCSV, sem a parte de banco: valida campos obrigatorios
 * e aplica mapRow linha a linha, acumulando os erros com o mesmo formato do Express.
 * O BOM inicial e removido (o Express nao removia e quebrava o round-trip
 * exportar -> importar, porque o primeiro cabecalho vinha como "﻿id").
 */
export function parseCsv<T>({
  text,
  requiredFields,
  mapRow
}: {
  text: string;
  requiredFields: string[];
  mapRow: (row: CsvRow) => T;
}): { mapped: MappedRow<T>[]; errors: ImportError[]; empty: boolean } {
  const lines = text.replace(/^﻿/, '').split('\n').filter((line) => line.trim());
  if (lines.length < 2) {
    return { mapped: [], errors: [{ row: 0, error: 'Arquivo CSV vazio ou invalido' }], empty: true };
  }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const mapped: MappedRow<T>[] = [];
  const errors: ImportError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    try {
      const values = parseCSVLine(line);
      const rowData: CsvRow = {};
      headers.forEach((header, idx) => {
        rowData[header] = values[idx] || '';
      });

      const missingFields = requiredFields.filter((field) => !rowData[field] || rowData[field].trim() === '');
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatorios ausentes: ${missingFields.join(', ')}`);
      }

      mapped.push({ row: i + 1, entity: mapRow(rowData) });
    } catch (error) {
      errors.push({ row: i + 1, error: (error as Error).message, data: line.substring(0, 100) });
    }
  }

  return { mapped, errors, empty: false };
}

export function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
  return groups;
}

/**
 * Grava as linhas ja validadas em lotes de `chunkSize` (1 subrequest por lote).
 * db.batch() e transacional: uma linha ruim (UNIQUE, FK) derruba o lote inteiro,
 * entao o lote que falha e refeito linha a linha para atribuir o erro a linha certa.
 * O refazer tem orcamento proprio (`retryBudget`) para nao estourar o limite de
 * subrequests quando o arquivo inteiro esta ruim.
 */
export async function insertRows<T>(
  db: D1Database,
  rows: MappedRow<T>[],
  toStatement: (entity: T) => Statement,
  { chunkSize = 100, retryBudget = 40 }: { chunkSize?: number; retryBudget?: number } = {}
): Promise<{ inserted: InsertedRow<T>[]; errors: ImportError[] }> {
  const inserted: InsertedRow<T>[] = [];
  const errors: ImportError[] = [];
  let budget = retryBudget;

  for (const group of chunk(rows, chunkSize)) {
    try {
      const results = await batch(db, group.map((item) => toStatement(item.entity)));
      results.forEach((result, index) => {
        inserted.push({ ...group[index], id: Number(result.meta?.last_row_id ?? 0) });
      });
    } catch (batchError) {
      for (const item of group) {
        if (budget <= 0) {
          errors.push({ row: item.row, error: (batchError as Error).message });
          continue;
        }
        budget--;
        try {
          const statement = toStatement(item.entity);
          const result = await run(db, statement.sql, statement.params);
          inserted.push({ ...item, id: Number(result.meta?.last_row_id ?? 0) });
        } catch (rowError) {
          errors.push({ row: item.row, error: (rowError as Error).message });
        }
      }
    }
  }

  return { inserted, errors };
}

/** Junta erros de validacao e de escrita no formato de resposta do Express. */
export function importResults(success: number, ...errorLists: ImportError[][]): ImportResults {
  const errors = errorLists.flat().sort((a, b) => a.row - b.row);
  return { success, failed: errors.length, errors };
}
