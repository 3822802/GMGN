#!/bin/bash
# Пуш в GitHub с токеном из .env.github
set -e
cd "$(dirname "$0")"

if [ -f .env.github ]; then
  # shellcheck disable=SC1091
  source .env.github
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Нет токена. Создай файл .env.github:"
  echo '   GITHUB_TOKEN=ghp_твой_токен'
  exit 1
fi

BRANCH="${1:-main}"
REMOTE="https://Pyatka11:${GITHUB_TOKEN}@github.com/Pyatka11/GMGN.git"

echo "→ push в Pyatka11/GMGN ($BRANCH)..."
git push "$REMOTE" "HEAD:$BRANCH" -u
