@echo off
title Zeta AI Launcher
color 0A

echo ================================================
echo            ZETA AI BASLATIYOR
echo ================================================

start "Zeta Backend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul

start "Zeta Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul

start http://localhost:5173

echo Zeta AI baslatildi!
pause