@echo off
title Zeta AI - Starter
color 0A

echo ================================
echo   ZETA AI STARTING...
echo ================================
echo.

REM Backend'i başlat
echo [1/2] Starting Backend...
start "Zeta Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul

REM Frontend'i başlat
echo [2/2] Starting Frontend...
start "Zeta Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul

REM Tarayıcıyı aç
echo.
echo [3/3] Opening Browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ================================
echo   ZETA AI STARTED!
echo ================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul