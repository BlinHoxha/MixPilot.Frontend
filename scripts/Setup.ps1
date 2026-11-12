$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$tooling = Join-Path $root '.tools/tooling'
# Project-local installations do not modify the system Node version or global PATH.
& npm.cmd install --prefix $tooling --no-audit --no-fund node@22 pnpm@10.32.1
if ($LASTEXITCODE -ne 0) { throw 'Tooling installation failed.' }
$env:PATH = (Join-Path $tooling 'node_modules/node/bin') + ';' + (Join-Path $root '.tools/tooling/node_modules/.bin') + ';' + $env:PATH
Push-Location $root
try {
  & (Join-Path $tooling 'node_modules/node/bin/node.exe') (Join-Path $tooling 'node_modules/pnpm/bin/pnpm.cjs') install --frozen-lockfile
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
  foreach ($app in @('web', 'mobile')) {
    $destination = Join-Path $root "apps/$app/.env.local"
    if (-not (Test-Path -LiteralPath $destination)) { Copy-Item -LiteralPath (Join-Path $root "apps/$app/.env.example") -Destination $destination }
  }
} finally { Pop-Location }
Write-Host 'Setup complete. Start the web app with: powershell -ExecutionPolicy Bypass -File scripts/Run.ps1 dev'
