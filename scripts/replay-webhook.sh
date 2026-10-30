#!/usr/bin/env bash
# ==============================================================================
# ShaktIQ Webhook Replay Script
# Demos: Valid webhook, Duplicate delivery (Idempotency), Invalid signature
# ==============================================================================

set -euo pipefail

API_URL="${API_URL:-http://localhost:4000/api/v1/webhooks/github}"
SECRET="${GITHUB_WEBHOOK_SECRET:-development-github-webhook-shared-secret}"
MODE="${1:-valid}"

echo "=========================================================="
echo " ShaktIQ Webhook Replay Tool"
echo " Target URL: $API_URL"
echo " Scenario:   $MODE"
echo "=========================================================="

# Sample GitHub push event payload
PAYLOAD='{
  "ref": "refs/heads/main",
  "before": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  "after": "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5",
  "repository": {
    "name": "orders",
    "full_name": "acme/orders",
    "html_url": "https://github.com/acme/orders",
    "default_branch": "main"
  },
  "head_commit": {
    "id": "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5",
    "message": "Update orders API spec"
  }
}'

# Helper function to compute HMAC-SHA256 signature
compute_signature() {
  local data="$1"
  local key="$2"
  local hash
  hash=$(printf "%s" "$data" | openssl dgst -sha256 -hmac "$key" | sed 's/^.* //')
  echo "sha256=$hash"
}

case "$MODE" in
  valid)
    DELIVERY_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    SIG=$(compute_signature "$PAYLOAD" "$SECRET")
    echo "Sending valid delivery: $DELIVERY_ID"
    echo "Signature: $SIG"
    echo "--- Server Response ---"
    curl -i -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "X-GitHub-Event: push" \
      -H "X-GitHub-Delivery: $DELIVERY_ID" \
      -H "X-Hub-Signature-256: $SIG" \
      -d "$PAYLOAD"
    echo ""
    ;;

  duplicate)
    DELIVERY_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    SIG=$(compute_signature "$PAYLOAD" "$SECRET")
    echo "Step 1: Sending first delivery ($DELIVERY_ID)..."
    RESP1=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "X-GitHub-Event: push" \
      -H "X-GitHub-Delivery: $DELIVERY_ID" \
      -H "X-Hub-Signature-256: $SIG" \
      -d "$PAYLOAD")
    echo "$RESP1"
    
    echo ""
    echo "Step 2: Replaying identical delivery ($DELIVERY_ID)..."
    RESP2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "X-GitHub-Event: push" \
      -H "X-GitHub-Delivery: $DELIVERY_ID" \
      -H "X-Hub-Signature-256: $SIG" \
      -d "$PAYLOAD")
    echo "$RESP2"
    echo ""
    echo "Idempotency test completed. Second response should have duplicate: true."
    ;;

  bad-signature)
    DELIVERY_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    BAD_SIG="sha256=0000000000000000000000000000000000000000000000000000000000000000"
    echo "Sending invalid signature: $BAD_SIG"
    echo "--- Server Response (Expect 401 INVALID_SIGNATURE) ---"
    curl -i -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "X-GitHub-Event: push" \
      -H "X-GitHub-Delivery: $DELIVERY_ID" \
      -H "X-Hub-Signature-256: $BAD_SIG" \
      -d "$PAYLOAD"
    echo ""
    ;;

  malformed)
    DELIVERY_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    SIG=$(compute_signature '{"bad":"payload"}' "$SECRET")
    echo "Sending malformed payload..."
    echo "--- Server Response (Expect 400 VALIDATION_ERROR) ---"
    curl -i -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "X-GitHub-Event: push" \
      -H "X-GitHub-Delivery: $DELIVERY_ID" \
      -H "X-Hub-Signature-256: $SIG" \
      -d '{"bad":"payload"}'
    echo ""
    ;;

  *)
    echo "Usage: $0 [valid|duplicate|bad-signature|malformed]"
    exit 1
    ;;
esac
