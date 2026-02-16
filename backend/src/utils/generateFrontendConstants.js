/*
 * Script para gerar arquivos de constantes do frontend a partir dos dados do backend.
 *
 * IMPORTANTE:
 * - Sempre que atualizar áreas, subáreas ou regras no backend, rode:
 *     node backend/src/utils/generateFrontendConstants.js
 * - Isso sobrescreve os arquivos em frontend/src/constants/ com os dados atualizados.
 * - Execute antes do build do frontend para garantir sincronização.
 */

const fs = require('fs');
const path = require('path');

// ========== BOOKS ==========
const { areaMapping, subareaMapping } = require('./validBookAreas.js');
const booksOutputPath = path.resolve(__dirname, '../../../frontend/src/constants/books.ts');

const areas = Object.keys(areaMapping);
const subareas = {};
for (const areaCode in subareaMapping) {
  const areaName = areas.find(name => areaMapping[name] === areaCode);
  if (areaName) {
    subareas[areaName] = Object.keys(subareaMapping[areaCode]);
  }
}

const booksContent = `/*
 * Este arquivo foi gerado automaticamente a partir do backend.
 * NÃO EDITE MANUALMENTE!
 * 
 * Para atualizar as áreas e subáreas, edite o arquivo validBookAreas.js no backend 
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

fs.writeFileSync(booksOutputPath, booksContent);
console.log('books.ts atualizado com sucesso!');

// ========== LOAN RULES ==========
const { LOAN_RULES, LOAN_RULES_META } = require('./validLoanRules.js');
const loanRulesOutputPath = path.resolve(__dirname, '../../../frontend/src/constants/loan_rules.ts');

const loanRulesContent = `/*
 * Este arquivo foi gerado automaticamente a partir do backend.
 * NÃO EDITE MANUALMENTE!
 * 
 * Para atualizar os campos de regras de empréstimo, edite o arquivo validLoanRules.js no backend, 
 * atualize a database e execute o script de geração novamente.
 */

export const LOAN_RULES = ${JSON.stringify(LOAN_RULES, null, 2)} as const;

export type LoanRuleField = typeof LOAN_RULES[number];

export const LOAN_RULES_META: Record<LoanRuleField, { label: string; unit: string }> = ${JSON.stringify(LOAN_RULES_META, null, 2)} as const;
`;

fs.writeFileSync(loanRulesOutputPath, loanRulesContent);
console.log('loanRules.ts atualizado com sucesso!');

// ========== ADICIONE OUTROS DOMÍNIOS AQUI NO FUTURO ==========