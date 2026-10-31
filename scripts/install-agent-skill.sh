#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# ShaktIQ AI Agent Skill & Plugin Installer
# Installs ShaktIQ as a native skill and CLI tool for Antigravity, Claude Code,
# Cursor, Windsurf, and modern AI coding agents.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "==> Installing ShaktIQ AI Agent Skill & Tool..."

# 1. Build the analyzer package
echo "==> Building @shaktiq/analyzer package..."
npm run build --workspace=@shaktiq/analyzer

# 2. Make CLI executables executable
chmod +x "${ROOT_DIR}/packages/analyzer/dist/cli.js"
chmod +x "${ROOT_DIR}/packages/analyzer/dist/mcp.js"

# 3. Create symlinks in ~/.local/bin or /usr/local/bin
TARGET_BIN_DIR="${HOME}/.local/bin"
mkdir -p "${TARGET_BIN_DIR}"

ln -sf "${ROOT_DIR}/packages/analyzer/dist/cli.js" "${TARGET_BIN_DIR}/shaktiq"
ln -sf "${ROOT_DIR}/packages/analyzer/dist/mcp.js" "${TARGET_BIN_DIR}/shaktiq-mcp"
echo "==> Symlinked 'shaktiq' and 'shaktiq-mcp' to ${TARGET_BIN_DIR}"

# 4. Install into Antigravity Global Customizations (~/.gemini/config/skills/shaktiq)
GLOBAL_AGY_SKILL_DIR="${HOME}/.gemini/config/skills/shaktiq"
mkdir -p "${GLOBAL_AGY_SKILL_DIR}"
cp -f "${ROOT_DIR}/skills/shaktiq/SKILL.md" "${GLOBAL_AGY_SKILL_DIR}/SKILL.md"
echo "==> Installed global Antigravity skill at ${GLOBAL_AGY_SKILL_DIR}/SKILL.md"

# 5. Install into Workspace Customizations (.agents/skills/shaktiq)
WORKSPACE_SKILL_DIR="${ROOT_DIR}/.agents/skills/shaktiq"
mkdir -p "${WORKSPACE_SKILL_DIR}"
cp -f "${ROOT_DIR}/skills/shaktiq/SKILL.md" "${WORKSPACE_SKILL_DIR}/SKILL.md"
echo "==> Installed workspace skill at ${WORKSPACE_SKILL_DIR}/SKILL.md"

echo ""
echo "========================================================================"
echo " ShaktIQ AI Agent Skill successfully installed!"
echo "========================================================================"
echo ""
echo "AI Agents can now invoke ShaktIQ in-flight using:"
echo "  - Command:   shaktiq analyze --base <file1> --head <file2> --json"
echo "  - Git Diff:  shaktiq git-diff --spec openapi.yaml --base-ref main --markdown"
echo "  - Slash Cmd: /shaktiq"
echo "  - MCP Tool:  shaktiq_analyze and shaktiq_git_diff"
echo ""

