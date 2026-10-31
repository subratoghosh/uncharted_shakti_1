#!/usr/bin/env bash
# ==============================================================================
# ShaktIQ Production n8n Workflow Deployment & Health Verification
# ==============================================================================

set -uo pipefail

RENDER_API_URL="${SHAKTIQ_API_URL:-https://uncharted-shakti-1.onrender.com}"
WORKFLOW_RUN_PATH="n8n/workflows/shaktiq-analyze-run.json"
WORKFLOW_ERR_PATH="n8n/workflows/shaktiq-error-handler.json"
DEFAULT_TOKEN="shaktiq-n8n-header-token-production"

echo "======================================================================"
echo "⚡ ShaktIQ Production n8n Workflow Setup & Verification"
echo "======================================================================"
echo "Target Backend API: ${RENDER_API_URL}"
echo ""

# 1. Verify Backend Health
echo "1. Checking Render Core API backend health..."
HEALTH_RESP=$(curl -s "${RENDER_API_URL}/health" || echo "")
if [[ "$HEALTH_RESP" == *"healthy"* ]]; then
  echo "   ✅ Render Backend API is LIVE and HEALTHY:"
  echo "      $HEALTH_RESP"
else
  echo "   ⚠️ Warning: Render Backend API returned unexpected response or is sleeping:"
  echo "      $HEALTH_RESP"
fi
echo ""

# 2. Options Guide
echo "2. How would you like to set up n8n in Production?"
echo "   ------------------------------------------------------------------"
echo "   [A] Render.com (Recommended Free/Starter Setup)"
echo "       1. Open Render Dashboard: https://dashboard.render.com"
echo "       2. Click 'New +' -> 'Web Service'"
echo "       3. Select 'Deploy from Docker Image' -> Image URL: n8nio/n8n:latest"
echo "       4. Name: shaktiq-n8n"
echo "       5. Add Environment Variables:"
echo "          - PORT: 5678"
echo "          - N8N_PORT: 5678"
echo "          - N8N_PROTOCOL: https"
echo "          - N8N_BASIC_AUTH_ACTIVE: true"
echo "          - N8N_BASIC_AUTH_USER: admin"
echo "          - N8N_BASIC_AUTH_PASSWORD: <your-secure-password>"
echo "          - N8N_ENCRYPTION_KEY: $(openssl rand -hex 16)"
echo "          - N8N_WEBHOOK_TOKEN: ${DEFAULT_TOKEN}"
echo "          - SHAKTIQ_API_URL: ${RENDER_API_URL}"
echo "          - INTERNAL_API_KEY: <same key as on shaktiq-api>"
echo "          - WEBHOOK_URL: https://shaktiq-n8n.onrender.com"
echo ""
echo "   [B] Direct REST API Auto-Import (If you already have an n8n instance)"
echo "       Run:"
echo "       N8N_HOST=https://your-n8n.onrender.com N8N_API_KEY=n8n_api_... ./scripts/setup-production-n8n.sh --import"
echo ""
echo "   [C] Manual Import in n8n Web UI"
echo "       1. Open your n8n console."
echo "       2. Click 'Workflows' -> '...' (top right) -> 'Import from File'."
echo "       3. Import: ${WORKFLOW_RUN_PATH}"
echo "       4. Toggle workflow to ACTIVE."
echo "       5. Import: ${WORKFLOW_ERR_PATH}"
echo "       6. Toggle workflow to ACTIVE."
echo ""

# 3. Automated REST API Import if requested
if [[ "${1:-}" == "--import" ]] || [[ -n "${N8N_API_KEY:-}" ]]; then
  N8N_HOST="${N8N_HOST:-}"
  N8N_KEY="${N8N_API_KEY:-}"

  if [[ -z "$N8N_HOST" || -z "$N8N_KEY" ]]; then
    echo "❌ Error: Please specify N8N_HOST and N8N_API_KEY environment variables."
    echo "   Example: N8N_HOST=https://my-n8n.onrender.com N8N_API_KEY=... ./scripts/setup-production-n8n.sh --import"
    exit 1
  fi

  echo "3. Importing workflows via n8n REST API to ${N8N_HOST}..."
  
  # Clean trailing slash
  N8N_HOST="${N8N_HOST%/}"

  # Import Main Run Workflow
  RUN_JSON=$(cat "$WORKFLOW_RUN_PATH")
  echo "   Uploading shaktiq-analyze-run..."
  UPLOAD_RUN=$(curl -s -X POST "${N8N_HOST}/api/v1/workflows" \
    -H "X-N8N-API-KEY: ${N8N_KEY}" \
    -H "Content-Type: application/json" \
    -d "$RUN_JSON")
  
  WORKFLOW_RUN_ID=$(echo "$UPLOAD_RUN" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4 || echo "")
  if [[ -n "$WORKFLOW_RUN_ID" ]]; then
    echo "   ✅ Created workflow 'shaktiq-analyze-run' (ID: ${WORKFLOW_RUN_ID})"
    # Activate
    curl -s -X POST "${N8N_HOST}/api/v1/workflows/${WORKFLOW_RUN_ID}/activate" \
      -H "X-N8N-API-KEY: ${N8N_KEY}" > /dev/null
    echo "   ✅ Activated workflow ${WORKFLOW_RUN_ID}"
  else
    echo "   ⚠️ Upload response: $UPLOAD_RUN"
  fi

  # Import Error Handler Workflow
  ERR_JSON=$(cat "$WORKFLOW_ERR_PATH")
  echo "   Uploading shaktiq-error-handler..."
  UPLOAD_ERR=$(curl -s -X POST "${N8N_HOST}/api/v1/workflows" \
    -H "X-N8N-API-KEY: ${N8N_KEY}" \
    -H "Content-Type: application/json" \
    -d "$ERR_JSON")
  
  WORKFLOW_ERR_ID=$(echo "$UPLOAD_ERR" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4 || echo "")
  if [[ -n "$WORKFLOW_ERR_ID" ]]; then
    echo "   ✅ Created workflow 'shaktiq-error-handler' (ID: ${WORKFLOW_ERR_ID})"
    curl -s -X POST "${N8N_HOST}/api/v1/workflows/${WORKFLOW_ERR_ID}/activate" \
      -H "X-N8N-API-KEY: ${N8N_KEY}" > /dev/null
    echo "   ✅ Activated workflow ${WORKFLOW_ERR_ID}"
  fi
  echo ""
fi

# 4. Final Wiring Instructions
echo "======================================================================"
echo "🔗 Final Step: Connect Render Backend to n8n Webhook"
echo "======================================================================"
echo "In Render Dashboard (https://dashboard.render.com) -> 'shaktiq-api' -> Environment:"
echo ""
echo "1. Set N8N_WEBHOOK_URL to:"
echo "   https://<your-n8n-domain>/webhook/shaktiq-analyze-run"
echo ""
echo "2. Set N8N_WEBHOOK_TOKEN to:"
echo "   ${DEFAULT_TOKEN}"
echo ""
echo "3. Ensure INTERNAL_API_KEY matches on both shaktiq-api and shaktiq-n8n."
echo "======================================================================"
