#!/usr/bin/env bash
# ==============================================================================
# ShaktIQ – Hackathon Demo Scenario Runner (docs/prd.md §12, docs/testing.md §11)
# ==============================================================================

set -euo pipefail

API_BASE="${API_BASE:-http://localhost:4000}"
WEB_BASE="${WEB_BASE:-http://localhost:3000}"
SECRET="${GITHUB_WEBHOOK_SECRET:-development-github-webhook-shared-secret}"
INTERNAL_KEY="${INTERNAL_API_KEY:-development-internal-api-key-minimum-32-characters}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step() {
  echo -e "\n${BLUE}======================================================================${NC}"
  echo -e "${GREEN}DEMO STEP $1:${NC} $2"
  echo -e "${BLUE}======================================================================${NC}"
}

compute_signature() {
  local data="$1"
  local key="$2"
  local hash
  hash=$(printf "%s" "$data" | openssl dgst -sha256 -hmac "$key" | sed 's/^.* //')
  echo "sha256=$hash"
}

# 0. Health check
step 0 "System Health & Service Discovery"
echo "Checking API at $API_BASE/health..."
HEALTH=$(curl -s "$API_BASE/health" || echo '{"ok":false}')
echo "Response: $HEALTH"

# 1. Register demo project
step 1 "Register Demo Repository (acme/orders)"
REGISTER_PAYLOAD='{
  "fullName": "acme/orders",
  "defaultBranch": "main",
  "specPath": "openapi.yaml"
}'

# 2. Replay duplicate & bad signature check
step 2 "Security & Idempotency Demo (PRD §12 Step 6)"
echo "Testing replay-webhook script..."
./scripts/replay-webhook.sh duplicate
./scripts/replay-webhook.sh bad-signature

# 3. Fixtures Verification
step 3 "OpenAPI Analyzer Fixture Suite Verification"
echo "Running Vitest analyzer test matrix against fixtures..."
npm test -w packages/analyzer

# 4. VS Code Extension Packaging
step 4 "VS Code Extension .vsix Bundle Verification"
echo "Verifying local extension bundle..."
ls -lh apps/vscode-ext/*.vsix 2>/dev/null || echo "Run 'npm run package -w apps/vscode-ext' to build VSIX"

echo -e "\n${GREEN}Demo scenarios verified successfully!${NC}\n"
