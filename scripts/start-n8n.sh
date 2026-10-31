#!/usr/bin/env bash
# ==============================================================================
# ShaktIQ — Automated Local n8n Launcher & Workflow Provisioner
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load unified .env if present
if [ -f "$ROOT_DIR/.env" ]; then
  # Export non-comment lines
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

export SHAKTIQ_API_URL="${SHAKTIQ_API_URL:-http://127.0.0.1:4000}"
export INTERNAL_API_KEY="${INTERNAL_API_KEY:-super_secret_internal_key_at_least_32_chars_long}"
export N8N_WEBHOOK_TOKEN="${N8N_WEBHOOK_TOKEN:-shaktiq-secret-n8n-token}"
export GITHUB_TOKEN="${GITHUB_TOKEN:-}"
export N8N_PORT="${N8N_PORT:-5678}"
export N8N_BLOCK_ENV_ACCESS_IN_NODE=false
export N8N_DEFAULT_BINARY_DATA_MODE=default
export EXECUTIONS_DATA_PRUNE=true
export EXECUTIONS_DATA_MAX_AGE=168

echo "⚡ Starting ShaktIQ n8n Engine..."
echo "   API Target:      $SHAKTIQ_API_URL"
echo "   Webhook Token:   $N8N_WEBHOOK_TOKEN"
echo "   Editor URL:      http://localhost:$N8N_PORT"
echo "=========================================================="

exec npx -y n8n start

