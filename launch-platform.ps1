# CarbonScore Platform Launcher
Write-Host "🚀 Launching CarbonScore Platform..." -ForegroundColor Green
Write-Host ""

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Port
    )
    
    Write-Host "Starting $Name on port $Port..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '🟢 $Name Running on port $Port' -ForegroundColor Green; $Command"
    Start-Sleep -Seconds 2
}

# Start Backend Services
Write-Host "📊 Starting Backend Services..." -ForegroundColor Yellow
Write-Host ""

# Calculation Service (Port 8001)
Start-Service -Name "Calculation Service" -Path "d:\Carbogo\services\calculation" -Command "python api.py" -Port "8001"

# ML Service (Port 8010)
Start-Service -Name "ML Service" -Path "d:\Carbogo\services\ml-service" -Command "python app/main.py" -Port "8010"

# PDF Service (Port 8020)
Start-Service -Name "PDF Service" -Path "d:\Carbogo\services\pdf-service" -Command "python app/main.py" -Port "8020"

# Wait for services to initialize
Write-Host ""
Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Start Frontend
Write-Host ""
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Service -Name "Next.js Frontend" -Path "d:\Carbogo\apps\web-nextjs" -Command "npm run dev" -Port "3000"

# Wait for frontend to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Platform Launch Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:          http://localhost:3000" -ForegroundColor White
Write-Host "   Calculation API:   http://localhost:8001/docs" -ForegroundColor White
Write-Host "   ML Service:        http://localhost:8010/docs" -ForegroundColor White
Write-Host "   PDF Service:       http://localhost:8020/docs" -ForegroundColor White
Write-Host ""
Write-Host "📖 Opening platform in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press any key to stop all services..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "Stopping all services..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.MainWindowTitle -like "*CarbonScore*"} | Stop-Process -Force
Write-Host "Done!" -ForegroundColor Green
