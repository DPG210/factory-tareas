#!/usr/bin/env bash
# Ejecuta una tarea de la fábrica con Claude Code en una rama nueva y la verifica.
# Uso: ./factory.sh "Descripción de la tarea"
set -euo pipefail

MAX_ATTEMPTS=3

if [[ $# -lt 1 || -z "${1// /}" ]]; then
  echo "Uso: $0 \"descripción de la tarea\"" >&2
  exit 2
fi

TASK="$*"

cd "$(dirname "$0")"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: el árbol de trabajo tiene cambios sin confirmar. Haz commit o stash antes." >&2
  exit 2
fi

BRANCH="factory/$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BRANCH"
echo "==> Rama creada: $BRANCH"

LOG_DIR="$(mktemp -d)"
trap 'rm -rf "$LOG_DIR"' EXIT

prompt="Lee CLAUDE.md y sigue sus reglas. Realiza la siguiente tarea: $TASK"
success=false
attempt=0

while (( attempt < MAX_ATTEMPTS )); do
  attempt=$((attempt + 1))
  echo "==> Intento $attempt de $MAX_ATTEMPTS"

  if ! claude -p "$prompt" \
    --permission-mode dontAsk \
    --allowedTools "Read,Edit,Write,Bash(npm test),Bash(npm run lint)" \
    --max-turns 30; then
    echo "Aviso: claude terminó con error en el intento $attempt" >&2
  fi

  echo "==> Verificando con npm test y npm run lint"
  test_ok=true
  lint_ok=true
  npm test >"$LOG_DIR/test.log" 2>&1 || test_ok=false
  npm run lint >"$LOG_DIR/lint.log" 2>&1 || lint_ok=false

  if $test_ok && $lint_ok; then
    success=true
    break
  fi

  failures=""
  $test_ok || failures+=$'\n\nSalida de npm test (últimas líneas):\n'"$(tail -n 40 "$LOG_DIR/test.log")"
  $lint_ok || failures+=$'\n\nSalida de npm run lint (últimas líneas):\n'"$(tail -n 40 "$LOG_DIR/lint.log")"
  echo "==> La verificación falló en el intento $attempt"

  prompt="Lee CLAUDE.md y sigue sus reglas. Realiza la siguiente tarea: $TASK

IMPORTANTE: el intento anterior ($attempt) falló porque npm test o npm run lint no pasan.
Revisa el estado actual del código y corrígelo sin modificar los tests existentes.$failures"
done

if $success; then
  git add -A
  if git diff --cached --quiet; then
    echo "==> Resultado: verificación correcta, pero no hubo cambios que confirmar (rama $BRANCH)."
  else
    git commit -m "Fábrica: $TASK"
    echo "==> Resultado: ÉXITO en $attempt intento(s). Cambios confirmados en la rama $BRANCH."
  fi
  exit 0
fi

echo "==> Resultado: FALLO tras $MAX_ATTEMPTS intentos. Los cambios quedan sin confirmar en la rama $BRANCH." >&2
exit 1
