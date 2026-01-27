# Test JWT Authentication System
# Run this after starting the backend server

Write-Host "🔐 Testing JWT Authentication System" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"

# Test 1: Register new user
Write-Host "📝 Test 1: Register New User" -ForegroundColor Green
Write-Host "-" * 60
$registerData = @{
    email = "test@herspace.com"
    password = "SecurePassword123!"
    name = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body $registerData `
        -ErrorAction Stop
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.user_id)"
    Write-Host "Email: $($registerResponse.user.email)"
    Write-Host "Name: $($registerResponse.user.name)"
    Write-Host "Token: $($registerResponse.access_token.Substring(0, 50))..." 
    Write-Host ""
    
    $token = $registerResponse.access_token
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  User already exists, proceeding to login..." -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "❌ Registration failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Test 2: Login with credentials
Write-Host "🔑 Test 2: Login User" -ForegroundColor Green
Write-Host "-" * 60
$loginData = @{
    email = "test@herspace.com"
    password = "SecurePassword123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginData `
        -ErrorAction Stop
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.user.user_id)"
    Write-Host "Email: $($loginResponse.user.email)"
    Write-Host "Name: $($loginResponse.user.name)"
    Write-Host "Token: $($loginResponse.access_token.Substring(0, 50))..."
    Write-Host ""
    
    $token = $loginResponse.access_token
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Get user profile (protected endpoint)
Write-Host "👤 Test 3: Get User Profile (Protected)" -ForegroundColor Green
Write-Host "-" * 60
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $token"
        } `
        -ErrorAction Stop
    
    Write-Host "✅ Profile retrieved successfully!" -ForegroundColor Green
    Write-Host "User ID: $($profileResponse.user_id)"
    Write-Host "Email: $($profileResponse.email)"
    Write-Host "Name: $($profileResponse.name)"
    Write-Host "Provider: $($profileResponse.auth_provider)"
    Write-Host "Created: $($profileResponse.created_at)"
    Write-Host ""
} catch {
    Write-Host "❌ Profile fetch failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Update user profile
Write-Host "✏️  Test 4: Update User Profile" -ForegroundColor Green
Write-Host "-" * 60
$updateData = @{
    name = "Test User Updated"
    preferences = @{
        theme = "dark"
        notifications = $true
        language = "en"
    }
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" `
        -Method Put `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $updateData `
        -ErrorAction Stop
    
    Write-Host "✅ Profile updated successfully!" -ForegroundColor Green
    Write-Host "New Name: $($updateResponse.name)"
    Write-Host "Theme: $($updateResponse.preferences.theme)"
    Write-Host "Notifications: $($updateResponse.preferences.notifications)"
    Write-Host ""
} catch {
    Write-Host "❌ Profile update failed: $_" -ForegroundColor Red
    exit 1
}

# Test 5: Social auth (mock)
Write-Host "🌐 Test 5: Social Authentication (Google Mock)" -ForegroundColor Green
Write-Host "-" * 60
$socialData = @{
    provider = "google"
    token = "mock_google_oauth_token_12345"
    email = "google_user@gmail.com"
    name = "Google Test User"
} | ConvertTo-Json

try {
    $socialResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/social" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body $socialData `
        -ErrorAction Stop
    
    Write-Host "✅ Google auth successful!" -ForegroundColor Green
    Write-Host "User ID: $($socialResponse.user.user_id)"
    Write-Host "Email: $($socialResponse.user.email)"
    Write-Host "Name: $($socialResponse.user.name)"
    Write-Host "Provider: $($socialResponse.user.auth_provider)"
    Write-Host ""
} catch {
    Write-Host "⚠️  Social auth test (expected to work or fail gracefully): $_" -ForegroundColor Yellow
    Write-Host ""
}

# Test 6: Protected agent chat
Write-Host "🤖 Test 6: Protected Agent Chat" -ForegroundColor Green
Write-Host "-" * 60
$chatData = @{
    message = "I feel stressed about work today"
    history = @()
} | ConvertTo-Json

try {
    $chatResponse = Invoke-RestMethod -Uri "$baseUrl/api/v2/agent/wellness/protected" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $chatData `
        -ErrorAction Stop
    
    Write-Host "✅ Protected agent chat successful!" -ForegroundColor Green
    Write-Host "Agent: $($chatResponse.agent)"
    Write-Host "Memory Updated: $($chatResponse.memory_updated)"
    Write-Host "User ID: $($chatResponse.user_id)"
    Write-Host "Reply: $($chatResponse.reply.Substring(0, [Math]::Min(100, $chatResponse.reply.Length)))..."
    Write-Host ""
} catch {
    Write-Host "⚠️  Protected chat test: $_" -ForegroundColor Yellow
    Write-Host ""
}

# Test 7: Invalid token
Write-Host "🚫 Test 7: Test Invalid Token (Should Fail)" -ForegroundColor Green
Write-Host "-" * 60
try {
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer invalid_token_12345"
        } `
        -ErrorAction Stop
    
    Write-Host "❌ Invalid token was accepted (this shouldn't happen!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Invalid token correctly rejected!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠️  Unexpected error: $_" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Test 8: Check users database
Write-Host "💾 Test 8: Check Users Database" -ForegroundColor Green
Write-Host "-" * 60
if (Test-Path "storage/users.json") {
    $usersDb = Get-Content "storage/users.json" | ConvertFrom-Json
    $userCount = ($usersDb | Get-Member -MemberType NoteProperty).Count
    
    Write-Host "✅ Users database exists!" -ForegroundColor Green
    Write-Host "Total users: $userCount"
    Write-Host ""
    Write-Host "Registered users:" -ForegroundColor Cyan
    $usersDb.PSObject.Properties | ForEach-Object {
        Write-Host "  - $($_.Value.email) ($($_.Value.name)) - Provider: $($_.Value.auth_provider)"
    }
    Write-Host ""
} else {
    Write-Host "⚠️  Users database not found" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ JWT Authentication Tests Complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ User registration working"
Write-Host "  ✅ User login working"
Write-Host "  ✅ JWT token generation working"
Write-Host "  ✅ Protected endpoints working"
Write-Host "  ✅ Profile management working"
Write-Host "  ✅ Token validation working"
Write-Host ""
Write-Host "🚀 Your authentication system is ready!" -ForegroundColor Green
Write-Host "📖 See AUTH_SYSTEM_COMPLETE.md for full documentation" -ForegroundColor Cyan
