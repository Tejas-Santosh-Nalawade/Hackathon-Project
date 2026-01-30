# HerSpace Docker Test Script
# Run this to test your Docker setup locally

Write-Host "🐳 HerSpace Docker Test Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
Write-Host "`nChecking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-Host "✅ $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host "`nChecking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env"
    Write-Host "📝 Please edit .env file with your actual API keys before continuing!" -ForegroundColor Yellow
    Write-Host "Press any key to continue after editing .env..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host "`n" -ForegroundColor White
Write-Host "Choose an option:" -ForegroundColor Cyan
Write-Host "1. Build and test BACKEND only" -ForegroundColor White
Write-Host "2. Build and test FRONTEND only" -ForegroundColor White
Write-Host "3. Build and test BOTH with Docker Compose (Recommended)" -ForegroundColor Green
Write-Host "4. Stop and remove all containers" -ForegroundColor Red
Write-Host "5. View logs" -ForegroundColor White
$choice = Read-Host "`nEnter choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n🔨 Building Backend Docker Image..." -ForegroundColor Cyan
        Set-Location backend
        docker build -t herspace-backend:latest .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend image built successfully!" -ForegroundColor Green
            Write-Host "`n🚀 Running Backend Container..." -ForegroundColor Cyan
            
            # Load environment variables
            Get-Content ..\.env | ForEach-Object {
                if ($_ -match '^([^=]+)=(.*)$') {
                    $name = $matches[1]
                    $value = $matches[2]
                    if ($name -notlike "VITE_*") {
                        Set-Item -Path "env:$name" -Value $value
                    }
                }
            }
            
            docker run -d `
                --name herspace-backend-test `
                -p 8000:8000 `
                -e "GROQ_API_KEY=$env:GROQ_API_KEY" `
                -e "JWT_SECRET=$env:JWT_SECRET" `
                -e "GOOGLE_CLIENT_ID=$env:GOOGLE_CLIENT_ID" `
                -e "GOOGLE_CLIENT_SECRET=$env:GOOGLE_CLIENT_SECRET" `
                -v "${PWD}\storage:/app/storage" `
                herspace-backend:latest
            
            Write-Host "✅ Backend container started!" -ForegroundColor Green
            Write-Host "`n📍 Backend API: http://localhost:8000" -ForegroundColor Cyan
            Write-Host "📖 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
            Write-Host "`n⏳ Waiting 10 seconds for startup..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
            
            Write-Host "`n🧪 Testing Backend Health..." -ForegroundColor Cyan
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing
                Write-Host "✅ Backend is running! Status: $($response.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Backend health check failed. Check logs with: docker logs herspace-backend-test" -ForegroundColor Yellow
            }
        }
        Set-Location ..
    }
    
    "2" {
        Write-Host "`n🔨 Building Frontend Docker Image..." -ForegroundColor Cyan
        Set-Location frontend
        
        # Load VITE variables
        Get-Content ..\.env | ForEach-Object {
            if ($_ -match '^(VITE_[^=]+)=(.*)$') {
                $name = $matches[1]
                $value = $matches[2]
                Set-Item -Path "env:$name" -Value $value
            }
        }
        
        docker build -t herspace-frontend:latest `
            --build-arg VITE_API_URL=$env:VITE_API_URL `
            --build-arg VITE_GOOGLE_CLIENT_ID=$env:VITE_GOOGLE_CLIENT_ID `
            .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend image built successfully!" -ForegroundColor Green
            Write-Host "`n🚀 Running Frontend Container..." -ForegroundColor Cyan
            
            docker run -d `
                --name herspace-frontend-test `
                -p 3000:80 `
                herspace-frontend:latest
            
            Write-Host "✅ Frontend container started!" -ForegroundColor Green
            Write-Host "`n📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "`n⏳ Waiting 5 seconds for startup..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
            
            Write-Host "`n🧪 Testing Frontend Health..." -ForegroundColor Cyan
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
                Write-Host "✅ Frontend is running! Status: $($response.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Frontend health check failed. Check logs with: docker logs herspace-frontend-test" -ForegroundColor Yellow
            }
        }
        Set-Location ..
    }
    
    "3" {
        Write-Host "`n🔨 Building All Services with Docker Compose..." -ForegroundColor Cyan
        docker compose build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ All images built successfully!" -ForegroundColor Green
            Write-Host "`n🚀 Starting All Services..." -ForegroundColor Cyan
            docker compose up -d
            
            Write-Host "✅ All containers started!" -ForegroundColor Green
            Write-Host "`n📍 Services:" -ForegroundColor Cyan
            Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
            Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
            Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
            
            Write-Host "`n⏳ Waiting 15 seconds for startup..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
            
            Write-Host "`n🧪 Testing Services..." -ForegroundColor Cyan
            
            # Test Backend
            try {
                $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing
                Write-Host "✅ Backend Health: OK ($($backendResponse.StatusCode))" -ForegroundColor Green
            } catch {
                Write-Host "❌ Backend Health: FAILED" -ForegroundColor Red
            }
            
            # Test Frontend
            try {
                $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
                Write-Host "✅ Frontend Health: OK ($($frontendResponse.StatusCode))" -ForegroundColor Green
            } catch {
                Write-Host "❌ Frontend Health: FAILED" -ForegroundColor Red
            }
            
            Write-Host "`n📊 View logs: docker compose logs -f" -ForegroundColor Cyan
            Write-Host "🛑 Stop services: docker compose down" -ForegroundColor Cyan
        }
    }
    
    "4" {
        Write-Host "`n🛑 Stopping and removing containers..." -ForegroundColor Yellow
        docker compose down
        docker stop herspace-backend-test 2>$null
        docker stop herspace-frontend-test 2>$null
        docker rm herspace-backend-test 2>$null
        docker rm herspace-frontend-test 2>$null
        Write-Host "✅ Cleanup complete!" -ForegroundColor Green
    }
    
    "5" {
        Write-Host "`n📊 Choose logs to view:" -ForegroundColor Cyan
        Write-Host "1. Backend logs" -ForegroundColor White
        Write-Host "2. Frontend logs" -ForegroundColor White
        Write-Host "3. All logs (Docker Compose)" -ForegroundColor White
        $logChoice = Read-Host "`nEnter choice (1-3)"
        
        switch ($logChoice) {
            "1" { docker logs -f herspace-backend-test }
            "2" { docker logs -f herspace-frontend-test }
            "3" { docker compose logs -f }
        }
    }
    
    default {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
    }
}

Write-Host "`n✨ Done!" -ForegroundColor Green
