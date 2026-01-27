# 🧪 Test Agentic APIs
# Run this script to test all v2 endpoints

$API_BASE = "http://localhost:8000"

Write-Host "🔷 Testing HerSpace Agentic APIs" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/" -Method Get
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend not responding. Is it running?" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Dashboard API
Write-Host "Test 2: Dashboard API (GET /api/v2/dashboard)" -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "$API_BASE/api/v2/dashboard" -Method Get
    Write-Host "✅ Dashboard API working" -ForegroundColor Green
    Write-Host "   Wellness Score: $($dashboard.wellness.score)" -ForegroundColor Gray
    Write-Host "   Tasks: $($dashboard.planner.tasks_done)/$($dashboard.planner.tasks_total)" -ForegroundColor Gray
    Write-Host "   Savings: $($dashboard.finance.savings_goal)%" -ForegroundColor Gray
} catch {
    Write-Host "❌ Dashboard API failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Greeting API
Write-Host "Test 3: Greeting API (GET /api/v2/greeting)" -ForegroundColor Yellow
try {
    $greeting = Invoke-RestMethod -Uri "$API_BASE/api/v2/greeting" -Method Get
    Write-Host "✅ Greeting API working" -ForegroundColor Green
    Write-Host "   Greeting: $($greeting.greeting)" -ForegroundColor Gray
    foreach ($insight in $greeting.insights) {
        Write-Host "   Insight: $insight" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Greeting API failed" -ForegroundColor Red
}
Write-Host ""

# Test 4: Agent Chat
Write-Host "Test 4: Agent Chat (POST /api/v2/agent/wellness)" -ForegroundColor Yellow
try {
    $chatBody = @{
        message = "I feel tired today"
        user_id = "test_user"
        history = @()
    } | ConvertTo-Json

    $chatResponse = Invoke-RestMethod -Uri "$API_BASE/api/v2/agent/wellness" -Method Post -Body $chatBody -ContentType "application/json"
    Write-Host "✅ Agent chat working" -ForegroundColor Green
    Write-Host "   Agent: $($chatResponse.agent)" -ForegroundColor Gray
    Write-Host "   Memory updated: $($chatResponse.memory_updated)" -ForegroundColor Gray
    Write-Host "   Reply preview: $($chatResponse.reply.Substring(0, [Math]::Min(80, $chatResponse.reply.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Agent chat failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Agentic Auto-Routing
Write-Host "Test 5: Agentic Auto-Routing (POST /api/v2/agentic-chat)" -ForegroundColor Yellow
try {
    $agenticBody = @{
        message = "I am stressed about work and money"
        user_id = "test_user"
        history = @()
    } | ConvertTo-Json

    $agenticResponse = Invoke-RestMethod -Uri "$API_BASE/api/v2/agentic-chat" -Method Post -Body $agenticBody -ContentType "application/json"
    Write-Host "✅ Agentic routing working" -ForegroundColor Green
    Write-Host "   Agents activated: $($agenticResponse.agents_activated -join ', ')" -ForegroundColor Gray
    $confidences = $agenticResponse.routing_confidence | ConvertTo-Json -Compress
    Write-Host "   Confidence scores: $confidences" -ForegroundColor Gray
} catch {
    Write-Host "❌ Agentic routing failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Agent Summary
Write-Host "Test 6: Agent Summary (GET /api/v2/agent/wellness/summary)" -ForegroundColor Yellow
try {
    $summary = Invoke-RestMethod -Uri "$API_BASE/api/v2/agent/wellness/summary" -Method Get
    Write-Host "✅ Agent summary working" -ForegroundColor Green
    Write-Host "   Agent: $($summary.title)" -ForegroundColor Gray
    Write-Host "   Memory count: $($summary.memory_count)" -ForegroundColor Gray
    Write-Host "   Interactions: $($summary.interaction_count)" -ForegroundColor Gray
    Write-Host "   Status: $($summary.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Agent summary failed" -ForegroundColor Red
}
Write-Host ""

# Test 7: All Agents
Write-Host "Test 7: All Agents List (GET /api/v2/agents)" -ForegroundColor Yellow
try {
    $agents = Invoke-RestMethod -Uri "$API_BASE/api/v2/agents" -Method Get
    Write-Host "✅ Agents list working" -ForegroundColor Green
    foreach ($agent in $agents.PSObject.Properties) {
        Write-Host "   $($agent.Value.title): $($agent.Value.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Agents list failed" -ForegroundColor Red
}
Write-Host ""

# Final summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎉 Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check dashboard again to see if wellness score changed" -ForegroundColor Gray
Write-Host "2. Start the frontend: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host "3. View API docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
