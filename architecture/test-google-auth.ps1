# Test Google OAuth Authentication
# Run this after setting up Google OAuth credentials

Write-Host "🔐 Testing Google OAuth Authentication System" -ForegroundColor Cyan
Write-Host ""

# Check if backend .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ backend\.env not found!" -ForegroundColor Red
    Write-Host "   Create it from backend\.env.example and add your GOOGLE_CLIENT_ID" -ForegroundColor Yellow
    exit 1
}

# Check if frontend .env.local exists
if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "❌ frontend\.env.local not found!" -ForegroundColor Red
    Write-Host "   Create it from frontend\.env.example and add your VITE_GOOGLE_CLIENT_ID" -ForegroundColor Yellow
    exit 1
}

# Check backend Google Client ID
$backendEnv = Get-Content "backend\.env" | Select-String "GOOGLE_CLIENT_ID"
if ($backendEnv -match "your_google_client_id") {
    Write-Host "⚠️  Backend GOOGLE_CLIENT_ID not configured" -ForegroundColor Yellow
    Write-Host "   Update backend\.env with your real Google Client ID" -ForegroundColor Yellow
    Write-Host ""
}

# Check frontend Google Client ID
$frontendEnv = Get-Content "frontend\.env.local" -ErrorAction SilentlyContinue | Select-String "VITE_GOOGLE_CLIENT_ID"
if ($frontendEnv -match "your_google_client_id") {
    Write-Host "⚠️  Frontend VITE_GOOGLE_CLIENT_ID not configured" -ForegroundColor Yellow
    Write-Host "   Update frontend\.env.local with your real Google Client ID" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📋 Setup Checklist:" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ 1. Google Cloud Project created"
Write-Host "✅ 2. OAuth 2.0 credentials generated"
Write-Host "✅ 3. Authorized JavaScript origins added (http://localhost:5173)"
Write-Host "✅ 4. GOOGLE_CLIENT_ID added to backend/.env"
Write-Host "✅ 5. VITE_GOOGLE_CLIENT_ID added to frontend/.env.local"
Write-Host "✅ 6. Dependencies installed (google-auth, @react-oauth/google)"
Write-Host ""

Write-Host "🧪 Manual Tests:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test 1: Start Backend"
Write-Host "  cd backend && python main.py"
Write-Host ""
Write-Host "Test 2: Start Frontend"
Write-Host "  cd frontend && npm run dev"
Write-Host ""
Write-Host "Test 3: Open Browser"
Write-Host "  http://localhost:5173/auth"
Write-Host ""
Write-Host "Test 4: Click 'Sign in with Google'"
Write-Host "  - Google popup should open"
Write-Host "  - Select your Google account"
Write-Host "  - Grant permissions"
Write-Host ""
Write-Host "Test 5: Verify Login"
Write-Host "  - Should redirect to dashboard"
Write-Host "  - User profile shows Google email"
Write-Host "  - Check backend/storage/users.json for new user"
Write-Host ""

Write-Host "📚 For detailed setup instructions, see:" -ForegroundColor Cyan
Write-Host "   GOOGLE_OAUTH_SETUP.md" -ForegroundColor Yellow
Write-Host ""

Write-Host "🎉 Ready to test Google OAuth!" -ForegroundColor Green
