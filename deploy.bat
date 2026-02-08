@echo off
cls
echo.
echo ========================================
echo    🚀 ZETA AI - AUTO DEPLOY
echo ========================================
echo.

cd C:\Users\Azram\Desktop\zeta-ai

echo 📦 Staging all changes...
git add .

echo.
set /p commit_msg="📝 Commit message (veya Enter = Auto): "

if "%commit_msg%"=="" (
    set commit_msg=Auto deploy - %date% %time%
)

echo.
echo 💾 Committing: %commit_msg%
git commit -m "%commit_msg%"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo ✅ DEPLOY COMPLETE!
echo ========================================
echo.
echo Railway otomatik deploy edecek (30-60 saniye)
echo Backend: https://zeta-ai-backend-production.up.railway.app
echo.
pause