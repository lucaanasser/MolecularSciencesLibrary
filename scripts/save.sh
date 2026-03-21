#!/bin/bash
# Este script guia commits por lotes com seleção de arquivos e mensagem padronizada.
# Uso principal: alias `save` para acelerar commits sem perder qualidade.
# Dependências: git, shell POSIX com arrays (bash), comandos status/diff/commit/push.

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

commit_count=0
default_summary="${1:-}"

print_divider() {
    printf "%b\n" "${BLUE}────────────────────────────────────────────────────────${NC}"
}

print_section() {
    print_divider
    printf "%b\n" "${BLUE}$1${NC}"
    print_divider
}

print_commit_type_help() {
    echo -e "${YELLOW}Resumo rápido dos tipos:${NC}" >&2
    echo "  feat     -> funcionalidade nova" >&2
    echo "  fix      -> correção de bug" >&2
    echo "  refactor -> reorganização sem mudar comportamento" >&2
    echo "  docs     -> documentação" >&2
    echo "  chore    -> manutenção/tarefa técnica" >&2
    echo "  test     -> testes" >&2
    echo -e "  Guia completo: documents/02-REGRAS/git/REGRAS_GIT.md" >&2
}

shorten_path() {
    local text="$1"
    local max=96
    (( ${#text} <= max )) && echo "$text" || echo "...${text: -max+3}"
}

status_label() {
    local xy="$1"
    if [[ "$xy" == "??" ]]; then echo "untracked"; return; fi
    if [[ "$xy" == *"D"* ]]; then echo "removed"; return; fi
    if [[ "$xy" == *"M"* ]]; then echo "modified"; return; fi
    if [[ "$xy" == *"A"* ]]; then echo "added"; return; fi
    if [[ "$xy" == *"R"* ]]; then echo "renamed"; return; fi
    echo "changed"
}

status_color() {
    case "$1" in
        removed) echo "$RED" ;;
        modified) echo "$YELLOW" ;;
        untracked) echo "$GREEN" ;;
        added) echo "$GREEN" ;;
        renamed) echo "$MAGENTA" ;;
        *) echo "$BLUE" ;;
    esac
}

# Carrega arquivos pendentes e seus status do git.
load_changed_entries() {
    files=()
    states=()
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        local xy raw path state
        xy="${line:0:2}"
        raw="${line:3}"
        path="$raw"
        [[ "$raw" == *" -> "* ]] && path="${raw##* -> }"
        state="$(status_label "$xy")"
        files+=("$path")
        states+=("$state")
    done < <(git status --porcelain)
}

stage_selected_entries() {
    local i path state
    for i in "${!selected[@]}"; do
        path="${selected[$i]}"
        state="${selected_states[$i]}"
        if [[ "$state" == "removed" ]]; then
            # Para removidos, atualiza o indice diretamente mesmo sem arquivo em disco.
            git update-index --remove -- "$path" || true
        else
            git add -- "$path"
        fi
    done
}

unstage_selected_entries() {
    local i path
    for i in "${!selected[@]}"; do
        path="${selected[$i]}"
        git restore --staged -- "$path" 2>/dev/null || git reset -q HEAD -- "$path" 2>/dev/null || true
    done
}

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
    print_section "🧩 Tipo do commit" >&2
    print_commit_type_help
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
print_section "💾 Script para commits automáticos"
echo -e "${BLUE}🌿 Branch atual:${NC} ${branch}"
if [[ "$branch" == "main" ]]; then
    echo -e "${YELLOW}⚠️  Você está na main. O script permite continuar, mas confirme com atenção.${NC}"
fi

while true; do
    load_changed_entries
    if ((${#files[@]} == 0)); then
        break
    fi

    print_section "📄 Arquivos pendentes"
    echo -e "${YELLOW}Atenção:${NC} caminhos longos aparecem resumidos no início para caber no terminal."
    for i in "${!files[@]}"; do
        sc="$(status_color "${states[$i]}")"
        printf "  %2d) %b%-10s%b %s\n" "$((i + 1))" "$sc" "${states[$i]}" "$NC" "$(shorten_path "${files[$i]}")"
    done

    print_divider
    echo -e "${BLUE}👉 Seleção:${NC} números (ex: 1,3,5) | a=todos | q=sair"
    read -rp "Escolha: " selection
    [[ "$selection" == "q" ]] && break

    selected=()
    selected_states=()
    if [[ "$selection" == "a" ]]; then
        selected=("${files[@]}")
        selected_states=("${states[@]}")
    else
        IFS=', ' read -r -a tokens <<< "$selection"
        for token in "${tokens[@]}"; do
            [[ "$token" =~ ^[0-9]+$ ]] || continue
            idx=$((token - 1))
            if (( idx >= 0 && idx < ${#files[@]} )); then
                selected+=("${files[$idx]}")
                selected_states+=("${states[$idx]}")
            fi
        done
    fi

    if ((${#selected[@]} == 0)); then
        echo -e "${YELLOW}Nenhum arquivo válido selecionado.${NC}"
        continue
    fi

    echo -e "${BLUE}Selecionados neste lote:${NC} ${#selected[@]} arquivo(s)"

    stage_selected_entries
    print_section "🧾 Staged neste lote"
    git --no-pager diff --cached --stat

    commit_type="$(pick_commit_type)"
    auto_scope="$(suggest_scope "${selected[@]}")"
    print_section "🏷️ Scope"
    echo "  backend | frontend | docs | scripts | repo | multi"
    echo "  multi = mais de uma área no mesmo commit"
    read -rp "Scope [${auto_scope}]: " input_scope
    scope="${input_scope:-$auto_scope}"

    default_msg="${default_summary:-atualiza ${scope} (${#selected[@]} arquivos)}"
    read -rp "Resumo do commit [${default_msg}]: " input_summary
    summary="${input_summary:-$default_msg}"

    if [[ ${#summary} -lt 10 ]]; then
        echo -e "${YELLOW}Resumo muito curto. Mínimo recomendado: 10 caracteres.${NC}"
        unstage_selected_entries
        continue
    fi

    commit_msg="${commit_type}(${scope}): ${summary}"
    print_section "📝 Mensagem gerada"
    echo "${commit_msg}"
    read -rp "Confirmar commit? [Y/n]: " confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        unstage_selected_entries
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

print_section "🚀 Finalização"
echo -e "${BLUE}Commits criados:${NC} ${commit_count}"
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
