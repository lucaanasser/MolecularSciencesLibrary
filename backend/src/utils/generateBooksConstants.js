/*
 * Script para gerar o arquivo books.ts no frontend a partir dos dados do backend.
 *
 * IMPORTANTE:
 * - Sempre que atualizar áreas ou subáreas em bookValidAreas.js, rode:
 *     node backend/src/utils/generateBooksConstants.js
 * - Isso sobrescreve frontend/src/constants/books.ts com os dados atualizados.
 * - Execute antes do build do frontend para garantir sincronização.
 */

const fs = require('fs');
const { areaMapping, subareaMapping } = require('./bookValidAreas.js');
const path = require('path');
const outputPath = path.resolve(__dirname, '../../../frontend/src/constants/books.ts');

// Extrai nomes das áreas
const areas = Object.keys(areaMapping);

// Extrai nomes das subáreas por área
const subareas = {};
for (const areaCode in subareaMapping) {
  const areaName = areas.find(name => areaMapping[name] === areaCode);
  if (areaName) {
    subareas[areaName] = Object.keys(subareaMapping[areaCode]);
  }
}

// Gera o conteúdo do arquivo
const content = `/*
 * Este arquivo foi gerado automaticamente a partir do backend.
 * NÃO EDITE MANUALMENTE!
 * 
 * Para atualizar as áreas e subáreas, edite o arquivo bookValidAreas.js no backend 
 * e execute o script de geração novamente.
 */

export const AREAS = ${JSON.stringify(areas, null, 2)} as const;

export type Area = typeof AREAS[number];

export const SUBAREAS: Record<Area, string[]> = ${JSON.stringify(subareas, null, 2)} as const;

export const STATUS = [
  "disponível",
  "emprestado",
  "reservado",
  "indisponível"
] as const;

export type Status = typeof STATUS[number];

export const LANGUAGES = [
  "Português",
  "Inglês",
  "Espanhol",
  "Outro"
] as const;

export type Language = typeof LANGUAGES[number];
`;

fs.writeFileSync(outputPath, content);
console.log('books.ts atualizado com sucesso!');