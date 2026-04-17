/*
 * Script para gerar arquivos de constantes do frontend a partir dos dados do backend.
 */

const fs = require('fs');
const path = require('path');
const { getLogger } = require('../../src/shared/logging/logger');
const log = getLogger(__filename);

const { areaMapping, subareaMapping } = require('../../src/domain-config/library/bookAreas');
const { LOAN_RULES, LOAN_RULES_META } = require('../../src/domain-config/library/loanRules');

function generateBooksConstants() {
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
  log.success('books.ts atualizado com sucesso', { output: booksOutputPath });
}

function generateLoanRulesConstants() {
  const loanRulesOutputPath = path.resolve(__dirname, '../../../frontend/src/constants/loan_rules.ts');

  const loanRulesContent = `/*
 * Este arquivo foi gerado automaticamente a partir do backend.
 * NÃO EDITE MANUALMENTE!
 */

export const LOAN_RULES = ${JSON.stringify(LOAN_RULES, null, 2)} as const;

export type LoanRuleField = typeof LOAN_RULES[number];

export const LOAN_RULES_META: Record<LoanRuleField, { label: string; unit: string }> = ${JSON.stringify(LOAN_RULES_META, null, 2)} as const;
`;

  fs.writeFileSync(loanRulesOutputPath, loanRulesContent);
  log.success('loan_rules.ts atualizado com sucesso', { output: loanRulesOutputPath });
}

function main() {
  log.start('Iniciando geracao de constantes do frontend');
  generateBooksConstants();
  generateLoanRulesConstants();
  log.success('Geracao de constantes finalizada');
}

main();
