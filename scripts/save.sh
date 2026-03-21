#!/bin/bash

# Este script guia commits por lotes com seleção de arquivos e mensagem padronizada.
# Uso principal: alias `save` para acelerar commits sem perder qualidade.
# Dependências: git, shell POSIX com arrays (bash), comandos status/diff/commit/push.

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

commit_count=0
default_summary="${1:-}"

# Retorna arquivos alterados e nao rastreados para seleção por lote.
get_changed_files() {
    mapfile -t tracked < <(git diff --name-only)
    mapfile -t staged < <(git diff --cached --name-only)
    mapfile -t untracked < <(git ls-files --others --exclude-standard)
    printf '%s\n' "${tracked[@]}" "${staged[@]}" "${untracked[@]}" | awk 'NF && !seen[$0]++'
}

# Sugere um escopo baseado nos caminhos dos arquivos selecionados.
suggest_scope() {
    local has_backend=0 has_frontend=0 has_docs=0 has_scripts=0
    for file in "$@"; do
        [[ "$file" == backend/* ]] && has_backend=1
        [[ "$file" == frontend/* ]] && has_frontend=1
        [[ "$file" == documents/* ]] && has_docs=1
        [[ "$file" == scripts/* ]] && has_scripts=1
    done
    local count=$((has_backend + has_frontend + has_docs + has_scripts))
    if (( count > 1 )); then echo "multi"; return; fi
    (( has_backend )) && { echo "backend"; return; }
    (( has_frontend )) && { echo "frontend"; return; }
    (( has_docs )) && { echo "docs"; return; }
    (( has_scripts )) && { echo "scripts"; return; }
    echo "repo"
}

# Escolhe tipo de commit em menu fechado para padronizar histórico.
pick_commit_type() {
    local types=("feat" "fix" "refactor" "docs" "chore" "test")
    echo -e "${BLUE}🧩 Tipo do commit:${NC}" >&2
    for i in "${!types[@]}"; do
        echo "  $((i + 1))) ${types[$i]}" >&2
    done
    while true; do
        read -rp "Escolha [1-6]: " choice >&2
        [[ "$choice" =~ ^[1-6]$ ]] && { echo "${types[$((choice - 1))]}"; return; }
        echo -e "${YELLOW}Escolha inválida.${NC}" >&2
    done
}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo -e "${RED}❌ Este diretório não é um repositório git.${NC}"
    exit 1
fi

branch="$(git branch --show-current)"
echo -e "${BLUE}🌿 Branch atual:${NC} ${branch}"
if [[ "$branch" == "main" ]]; then
    echo -e "${YELLOW}⚠️  Você está na main. O script permite continuar, mas confirme com atenção.${NC}"
fi

while true; do
    mapfile -t files < <(get_changed_files)
    if ((${#files[@]} == 0)); then
        break
    fi

    echo -e "\n${BLUE}📄 Arquivos pendentes:${NC}"
    for i in "${!files[@]}"; do
        printf "  %2d) %s\n" "$((i + 1))" "${files[$i]}"
    done

    read -rp "Selecione arquivos (ex: 1,3,5 | a=todos | q=sair): " selection
    [[ "$selection" == "q" ]] && break

    selected=()
    if [[ "$selection" == "a" ]]; then
        selected=("${files[@]}")
    else
        IFS=', ' read -r -a tokens <<< "$selection"
        for token in "${tokens[@]}"; do
            [[ "$token" =~ ^[0-9]+$ ]] || continue
            idx=$((token - 1))
            (( idx >= 0 && idx < ${#files[@]} )) && selected+=("${files[$idx]}")
        done
    fi

    if ((${#selected[@]} == 0)); then
        echo -e "${YELLOW}Nenhum arquivo válido selecionado.${NC}"
        continue
    fi

    git add -- "${selected[@]}"
    echo -e "\n${BLUE}🧾 Staged neste lote:${NC}"
    git diff --cached --stat

    commit_type="$(pick_commit_type)"
    auto_scope="$(suggest_scope "${selected[@]}")"
    read -rp "Scope [${auto_scope}]: " input_scope
    scope="${input_scope:-$auto_scope}"

    default_msg="${default_summary:-atualiza ${scope} (${#selected[@]} arquivos)}"
    read -rp "Resumo do commit [${default_msg}]: " input_summary
    summary="${input_summary:-$default_msg}"

    if [[ ${#summary} -lt 10 ]]; then
        echo -e "${YELLOW}Resumo muito curto. Mínimo recomendado: 10 caracteres.${NC}"
        git restore --staged -- "${selected[@]}"
        continue
    fi

    commit_msg="${commit_type}(${scope}): ${summary}"
    echo -e "${BLUE}📝 Mensagem gerada:${NC} ${commit_msg}"
    read -rp "Confirmar commit? [Y/n]: " confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        git restore --staged -- "${selected[@]}"
        continue
    fi

    git commit -m "$commit_msg"
    commit_count=$((commit_count + 1))
    default_summary=""
done

if ((commit_count == 0)); then
    echo -e "${YELLOW}Nenhum commit criado.${NC}"
    exit 0
fi

echo -e "\n${BLUE}🚀 Commits criados: ${commit_count}${NC}"
read -rp "Executar git push agora? [Y/n]: " push_now
if [[ ! "$push_now" =~ ^[Nn]$ ]]; then
    if ! git push; then
        echo -e "${YELLOW}Push sem upstream. Tentando com --set-upstream origin ${branch}.${NC}"
        git push --set-upstream origin "$branch"
    fi
    echo -e "${GREEN}✅ Push concluído.${NC}"
else
    echo -e "${YELLOW}Push adiado pelo usuário.${NC}"
fi
