# Minimal dev runner: starts backend (FastAPI) and frontend (Vite)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "DASHBOARD"

if (-not (Test-Path (Join-Path $backend ".env"))) {
    Write-Host "Missing backend\.env. Copy backend\.env.example and add keys." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $frontend
    npm install
    Pop-Location
}

Write-Host "Starting backend on http://localhost:8000" -ForegroundColor Cyan
$null = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backend'; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8000"
)

Start-Sleep -Seconds 2

Write-Host "Starting frontend on http://localhost:5173" -ForegroundColor Cyan
$null = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontend'; npm run dev"
)

Write-Host "Both servers launched in separate windows. Close them or Ctrl+C to stop." -ForegroundColor Green
