# Backend Server Startup Script
# Run this script to start the FastAPI backend server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AI Support Platform - Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a .env file with your Groq API key:" -ForegroundColor Yellow
    Write-Host "1. Copy .env.example to .env" -ForegroundColor Yellow
    Write-Host "2. Edit .env and add your API key" -ForegroundColor Yellow
    Write-Host "3. See API_KEY_SETUP.md for detailed instructions" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check if virtual environment exists
if (-Not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "❌ ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create the virtual environment:" -ForegroundColor Yellow
    Write-Host "   py -m venv venv" -ForegroundColor Yellow
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "   pip install -r requirements.txt" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✓ Environment file found" -ForegroundColor Green
Write-Host "✓ Virtual environment found" -ForegroundColor Green
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Check if uvicorn is installed
try {
    $null = & ".\venv\Scripts\python.exe" -c "import uvicorn" 2>&1
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Dependencies not installed" -ForegroundColor Red
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & ".\venv\Scripts\pip.exe" install -r requirements.txt
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting server on http://localhost:8000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  GET  http://localhost:8000/" -ForegroundColor White
Write-Host "  GET  http://localhost:8000/api/v1/bots" -ForegroundColor White
Write-Host "  POST http://localhost:8000/api/v1/chat" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server using the venv's uvicorn directly
& ".\venv\Scripts\uvicorn.exe" main:app --reload
