@echo off
echo =========================================
echo  Library Management System - DEPLOY
echo =========================================

:: Step 1: Build frontend
echo [1/3] Building React frontend...
cd /d "%~dp0frontend"
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo     Frontend built successfully.

:: Step 2: Start/restart backend with PM2
echo [2/3] Starting backend with PM2...
cd /d "%~dp0"
pm2 delete library-api 2>nul
pm2 start ecosystem.config.js
if %errorlevel% neq 0 (
    echo WARNING: PM2 not found, starting with node directly...
    start "Library API" /min cmd /c "cd backend && node src/server.js"
)

:: Step 3: Save PM2 state and show status
echo [3/3] Saving PM2 state...
pm2 save 2>nul
pm2 list 2>nul

echo.
echo =========================================
echo  DEPLOYED SUCCESSFULLY
echo  Application URL: http://localhost:8000
echo =========================================
echo.
pause
