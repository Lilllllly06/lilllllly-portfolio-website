#!/bin/bash

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/root/lilllllly-portfolio-website}"
SESSION_NAME="${SESSION_NAME:-portfolio}"
PORT="${PORT:-5000}"

tmux kill-server 2>/dev/null || true

cd "$PROJECT_DIR"

git fetch && git reset origin/main --hard

if [ -f "requirements.txt" ]; then
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  START_CMD="source venv/bin/activate && flask run --host=0.0.0.0 --port=$PORT"
elif [ -f "package.json" ]; then
  npm ci
  npm run build
  START_CMD="npm run preview -- --host 0.0.0.0 --port $PORT"
else
  echo "No supported dependency file found in $PROJECT_DIR" >&2
  exit 1
fi

tmux new-session -d -s "$SESSION_NAME" "cd \"$PROJECT_DIR\" && $START_CMD"

echo "Redeployed $PROJECT_DIR in tmux session $SESSION_NAME on port $PORT"
