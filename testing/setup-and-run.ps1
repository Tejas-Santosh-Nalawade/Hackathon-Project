# 🚀 HerSpace Setup & Test Script
# Run this to set up and verify the agentic backend

Write-Host "🔷 HerSpace - Agentic AI Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location backend

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Verify .env file exists
Write-Host "🔑 Step 2: Checking environment configuration..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Please ensure GROQ_API_KEY is set." -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}
Write-Host ""

# Step 3: Verify storage directory
Write-Host "💾 Step 3: Setting up storage directory..." -ForegroundColor Yellow
if (-Not (Test-Path "storage")) {
    New-Item -ItemType Directory -Path "storage" | Out-Null
    Write-Host "✅ Created storage directory" -ForegroundColor Green
} else {
    Write-Host "✅ Storage directory exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Quick syntax check
Write-Host "🔍 Step 4: Verifying Python syntax..." -ForegroundColor Yellow
python -m py_compile main.py 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend code is valid" -ForegroundColor Green
} else {
    Write-Host "⚠️  Syntax check failed, but may still work" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Start server
Write-Host "🚀 Step 5: Starting backend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend will run on: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API docs available at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
python main.py
