param([ValidateSet('dev','mobile','check','build','test:e2e','contracts:generate','contracts:check')][string]$Task = 'dev')
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$tooling = Join-Path $root '.tools/tooling/node_modules'
$node = Join-Path $tooling 'node/bin/node.exe'
if (-not (Test-Path -LiteralPath $node)) { throw 'Run scripts/Setup.ps1 first, or use your installed Node 22.12+ and pnpm 10.32.1.' }
$env:PATH = (Join-Path $tooling 'node/bin') + ';' + (Join-Path $root '.tools/tooling/node_modules/.bin') + ';' + $env:PATH
Push-Location $root
try { & $node (Join-Path $tooling 'pnpm/bin/pnpm.cjs') $Task; exit $LASTEXITCODE } finally { Pop-Location }
