#!/usr/bin/env bash
set -euo pipefail
command -v git >/dev/null || { echo 'Git is required.' >&2; exit 1; }
command -v gh >/dev/null || { echo 'GitHub CLI (gh) is required.' >&2; exit 1; }
gh auth status >/dev/null || { echo 'Authenticate first: gh auth login' >&2; exit 1; }
repo_name="${1:-$(basename "$PWD" | tr '[:upper:] ' '[:lower:]-' | tr -cd '[:alnum:]-')}"
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git init; fi
if git remote get-url origin >/dev/null 2>&1; then echo 'An origin remote already exists; refusing to change it.' >&2; exit 1; fi
git add .
if ! git diff --cached --quiet; then git commit -m 'Initial commit'; fi
gh repo create "$repo_name" --public --source=. --remote=origin --push
gh repo view --json url --jq .url
