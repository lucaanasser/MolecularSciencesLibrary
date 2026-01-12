#!/bin/bash

# Display Seed - Mostra informações dos dados de seed para desenvolvimento
# Use: dseed

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

clear
echo -e "${BLUE}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          BibliotecaCM - Dados de Seed (DEV MODE)             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${RED}${BOLD}⚠️  SENHA PADRÃO PARA TODOS OS USUÁRIOS: ${YELLOW}1${NC}"
echo ""

# USUÁRIOS
echo -e "${CYAN}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│${NC} ${BOLD}👤 USUÁRIOS${NC}                                                  ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┬───────────────────────┬──────────────┬────────────┤${NC}"
echo -e "${CYAN}│${NC} ${BOLD}NUSP${NC}     ${CYAN}│${NC} ${BOLD}Nome${NC}                  ${CYAN}│${NC} ${BOLD}Email${NC}        ${CYAN}│${NC} ${BOLD}Tipo${NC}       ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┼───────────────────────┼──────────────┼────────────┤${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}1${NC}        ${CYAN}│${NC} Admin                 ${CYAN}│${NC} admin@usp    ${CYAN}│${NC} ${MAGENTA}Admin${NC}      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}2${NC}        ${CYAN}│${NC} ProAluno              ${CYAN}│${NC} pro@usp      ${CYAN}│${NC} ${GREEN}ProAluno${NC}   ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┼───────────────────────┼──────────────┼────────────┤${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}3${NC}        ${CYAN}│${NC} Teste Aluno 1         ${CYAN}│${NC} aluno3@usp   ${CYAN}│${NC} Aluno      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}4${NC}        ${CYAN}│${NC} Teste Aluno 2         ${CYAN}│${NC} aluno4@usp   ${CYAN}│${NC} Aluno      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}5${NC}        ${CYAN}│${NC} Teste Aluno 3         ${CYAN}│${NC} aluno5@usp   ${CYAN}│${NC} Aluno      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}6${NC}        ${CYAN}│${NC} Teste Aluno 4         ${CYAN}│${NC} aluno6@usp   ${CYAN}│${NC} Aluno      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}7${NC}        ${CYAN}│${NC} Teste Aluno 5         ${CYAN}│${NC} aluno7@usp   ${CYAN}│${NC} Aluno      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}8${NC}        ${CYAN}│${NC} Teste Aluno 6         ${CYAN}│${NC} aluno8@usp   ${CYAN}│${NC} Aluno      ${CYAN}│${NC}"
echo -e "${CYAN}└──────────┴───────────────────────┴──────────────┴────────────┘${NC}"
echo ""

# LIVROS
echo -e "${CYAN}┌─────────────────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│${NC} ${BOLD}📚 LIVROS (25 livros)${NC}                                                       ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┬──────────────────┬───────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} ${BOLD}Barras${NC}   ${CYAN}│${NC} ${BOLD}Código Bibl.${NC}     ${CYAN}│${NC} ${BOLD}Título${NC}                                        ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┼──────────────────┼───────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} ${GREEN}FÍSICA${NC}   ${CYAN}│${NC}                  ${CYAN}│${NC}                                               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}1${NC}        ${CYAN}│${NC} FIS-01.01-v1     ${CYAN}│${NC} Física I - Mecânica (Halliday)                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}2${NC}        ${CYAN}│${NC} FIS-01.02-v1     ${CYAN}│${NC} Física I - Mecânica (Halliday)                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}3${NC}        ${CYAN}│${NC} FIS-02.01-v2     ${CYAN}│${NC} Física II - Termodinâmica                     ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}4${NC}        ${CYAN}│${NC} FIS-03.01-v3     ${CYAN}│${NC} Física III - Eletromagnetismo                 ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}5${NC}        ${CYAN}│${NC} FIS-04.01        ${CYAN}│${NC} Física Moderna (Eisberg)                      ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┼──────────────────┼───────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} ${GREEN}QUÍMICA${NC}  ${CYAN}│${NC}                  ${CYAN}│${NC}                                               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}6${NC}        ${CYAN}│${NC} QUI-01.01        ${CYAN}│${NC} Química Geral (Atkins)                        ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}7${NC}        ${CYAN}│${NC} QUI-01.02        ${CYAN}│${NC} Química Geral (Atkins)                        ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}8${NC}        ${CYAN}│${NC} QUI-02.01-v1     ${CYAN}│${NC} Química Orgânica (Solomons)                   ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}9${NC}        ${CYAN}│${NC} QUI-02.02-v2     ${CYAN}│${NC} Química Orgânica (Solomons)                   ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}10${NC}       ${CYAN}│${NC} QUI-03.01-v1     ${CYAN}│${NC} Físico-Química (Atkins)                       ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┼──────────────────┼───────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} ${GREEN}BIOLOGIA${NC} ${CYAN}│${NC}                  ${CYAN}│${NC}                                               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}11${NC}       ${CYAN}│${NC} BIO-01.01        ${CYAN}│${NC} Biologia Celular (Alberts)                    ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}12${NC}       ${CYAN}│${NC} BIO-02.01        ${CYAN}│${NC} Bioquímica (Lehninger)                        ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}13${NC}       ${CYAN}│${NC} BIO-02.02        ${CYAN}│${NC} Bioquímica (Voet)                             ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}14${NC}       ${CYAN}│${NC} BIO-03.01        ${CYAN}│${NC} Genética (Griffiths)                          ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}15${NC}       ${CYAN}│${NC} BIO-04.01        ${CYAN}│${NC} Microbiologia (Madigan)                       ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┼──────────────────┼───────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} ${GREEN}MATEMÁT.${NC} ${CYAN}│${NC}                  ${CYAN}│${NC}                                               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}16${NC}       ${CYAN}│${NC} MAT-01.01-v1     ${CYAN}│${NC} Cálculo I (Stewart)                           ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}17${NC}       ${CYAN}│${NC} MAT-01.02-v1     ${CYAN}│${NC} Cálculo I (Stewart)                           ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}18${NC}       ${CYAN}│${NC} MAT-02.01-v2     ${CYAN}│${NC} Cálculo II (Stewart)                          ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}19${NC}       ${CYAN}│${NC} MAT-03.01        ${CYAN}│${NC} Álgebra Linear (Boldrini)                     ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}20${NC}       ${CYAN}│${NC} MAT-04.01        ${CYAN}│${NC} Equações Diferenciais (Boyce)                 ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┼──────────────────┼───────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} ${GREEN}COMP.${NC} ${CYAN}   │${NC}                  ${CYAN}│${NC}                                               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}21${NC}       ${CYAN}│${NC} CMP-01.01        ${CYAN}│${NC} Python (Downey)                               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}22${NC}       ${CYAN}│${NC} CMP-02.01        ${CYAN}│${NC} Algoritmos (Cormen)                           ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}23${NC}       ${CYAN}│${NC} CMP-03.01        ${CYAN}│${NC} Sistemas Operacionais (Tanenbaum)             ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}24${NC}       ${CYAN}│${NC} CMP-04.01        ${CYAN}│${NC} Redes (Tanenbaum)                             ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}25${NC}       ${CYAN}│${NC} CMP-05.01        ${CYAN}│${NC} Banco de Dados (Elmasri)                      ${CYAN}│${NC}"
echo -e "${CYAN}└──────────┴──────────────────┴───────────────────────────────────────────────┘${NC}"
echo ""

# DISCIPLINAS
echo -e "${CYAN}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│${NC} ${BOLD}🎓 DISCIPLINAS (15 disciplinas)${NC}                              ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┬───────────────────────────────┬───────────────────┤${NC}"
echo -e "${CYAN}│${NC} ${BOLD}Código${NC}   ${CYAN}│${NC} ${BOLD}Nome${NC}                          ${CYAN}│${NC} ${BOLD}Unidade${NC}           ${CYAN}│${NC}"
echo -e "${CYAN}├──────────┼───────────────────────────────┼───────────────────┤${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}QFL1100${NC}  ${CYAN}│${NC} Química Geral                 ${CYAN}│${NC} IQ                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}QFL2308${NC}  ${CYAN}│${NC} Química Orgânica I            ${CYAN}│${NC} IQ                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}QFL3401${NC}  ${CYAN}│${NC} Físico-Química I              ${CYAN}│${NC} IQ                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}QFL4500${NC}  ${CYAN}│${NC} Química Analítica             ${CYAN}│${NC} IQ                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}BIO0101${NC}  ${CYAN}│${NC} Biologia Celular              ${CYAN}│${NC} IB                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}BIO0202${NC}  ${CYAN}│${NC} Bioquímica                    ${CYAN}│${NC} IB                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}BIO0303${NC}  ${CYAN}│${NC} Genética                      ${CYAN}│${NC} IB                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}FIS1201${NC}  ${CYAN}│${NC} Física I                      ${CYAN}│${NC} IF                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}FIS1202${NC}  ${CYAN}│${NC} Física II                     ${CYAN}│${NC} IF                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}FIS1203${NC}  ${CYAN}│${NC} Física III                    ${CYAN}│${NC} IF                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}MAT0111${NC}  ${CYAN}│${NC} Cálculo I                     ${CYAN}│${NC} IME               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}MAT0122${NC}  ${CYAN}│${NC} Cálculo II                    ${CYAN}│${NC} IME               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}MAT0205${NC}  ${CYAN}│${NC} Álgebra Linear                ${CYAN}│${NC} IME               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}MAC0110${NC}  ${CYAN}│${NC} Introdução à Computação       ${CYAN}│${NC} IME               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ${YELLOW}MAC0122${NC}  ${CYAN}│${NC} Algoritmos                    ${CYAN}│${NC} IME               ${CYAN}│${NC}"
echo -e "${CYAN}└──────────┴───────────────────────────────┴───────────────────┘${NC}"
echo ""

# GUIA RÁPIDO
echo -e "${MAGENTA}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${MAGENTA}│${NC} ${BOLD}💡 GUIA RÁPIDO DE USO${NC}                                        ${MAGENTA}│${NC}"
echo -e "${MAGENTA}├──────────────────────────────────────────────────────────────┤${NC}"
echo -e "${MAGENTA}│${NC}  ${GREEN}→${NC} Login:                NUSP + senha ${YELLOW}1${NC}                      ${MAGENTA}│${NC}"
echo -e "${MAGENTA}│${NC}  ${GREEN}→${NC} Cadastrar livro:      Digite ${YELLOW}1${NC}, ${YELLOW}2${NC}, ${YELLOW}3${NC}... no scanner        ${MAGENTA}│${NC}"
echo -e "${MAGENTA}│${NC}  ${GREEN}→${NC} Vincular disciplina:  Use códigos ${YELLOW}QFL1100${NC}, ${YELLOW}BIO0101${NC}, etc.  ${MAGENTA}│${NC}"
echo -e "${MAGENTA}│${NC}  ${GREEN}→${NC} Resetar seed:         ${YELLOW}seed${NC}                                ${MAGENTA}│${NC}"
echo -e "${MAGENTA}└──────────────────────────────────────────────────────────────┘${NC}"
echo ""
