@echo off
chcp 65001 >nul
color 0E
cls

echo.
echo ═══════════════════════════════════════════════════
echo    🎨 ZETA AI - SADECE FRONTEND BUILD
echo ═══════════════════════════════════════════════════
echo.

cd /d "%~dp0frontend"

echo 🔨 Build ediliyor...
call npm run build

if errorlevel 1 (
    echo ❌ Build BAŞARISIZ!
    pause
    exit /b 1
)

echo.
echo ✅ Frontend build tamamlandı!
echo 📁 Dosyalar: %CD%\dist
echo.
echo 📤 YÜKLEME:
echo    dist/ klasörü içindeki TÜM dosyaları
echo    cPanel httpdocs/ köküne yükle
echo.
pause
