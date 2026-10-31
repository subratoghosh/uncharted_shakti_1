# ==============================================================================
# shaktIQ AI Agent Skill & Plugin Installer (Windows PowerShell)
# Installs shaktIQ as a native skill for Google Antigravity and AI coding agents.
# ==============================================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

Write-Host "==> Installing shaktIQ AI Agent Skill for Windows..." -ForegroundColor Cyan

# 1. Build the analyzer package
Write-Host "==> Building @shaktiq/analyzer package..." -ForegroundColor Cyan
npm run build --workspace=@shaktiq/analyzer

# 2. Install into Workspace Customizations (.agents\skills\shaktiq)
$workspaceSkillDir = Join-Path $rootDir ".agents\skills\shaktiq"
if (-not (Test-Path $workspaceSkillDir)) {
    New-Item -ItemType Directory -Path $workspaceSkillDir -Force | Out-Null
}
$sourceSkill = Join-Path $rootDir ".agents\skills\shaktiq\SKILL.md"
if (-not (Test-Path $sourceSkill)) {
    $sourceSkill = Join-Path $rootDir "skills\shaktiq\SKILL.md"
}
Copy-Item -Path $sourceSkill -Destination (Join-Path $workspaceSkillDir "SKILL.md") -Force
Write-Host "==> Installed workspace skill at $workspaceSkillDir\SKILL.md" -ForegroundColor Green

# 3. Install into Antigravity Global Customizations ($env:USERPROFILE\.gemini\config\skills\shaktiq)
$globalSkillDir = Join-Path $env:USERPROFILE ".gemini\config\skills\shaktiq"
if (-not (Test-Path $globalSkillDir)) {
    New-Item -ItemType Directory -Path $globalSkillDir -Force | Out-Null
}
Copy-Item -Path $sourceSkill -Destination (Join-Path $globalSkillDir "SKILL.md") -Force
Write-Host "==> Installed global Antigravity skill at $globalSkillDir\SKILL.md" -ForegroundColor Green

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host " shaktIQ AI Agent Skill successfully installed!" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "AI Agents can now invoke shaktIQ in-flight using:" -ForegroundColor Yellow
Write-Host "  - Command:   npm run shaktiq -- analyze --base <file1> --head <file2> --json"
Write-Host "  - Git Diff:  npm run shaktiq -- git-diff --spec openapi.yaml --base-ref main --markdown"
Write-Host "  - Direct:    node packages/analyzer/dist/cli.js analyze --base <file1> --head <file2>"
Write-Host ""
