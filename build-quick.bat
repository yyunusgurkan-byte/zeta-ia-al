@echo off
chcp 65001 >nul
color 0B
cls

echo.
echo ═══════════════════════════════════════════════════
echo    ⚡ ZETA AI - HIZLI BUILD
echo ═══════════════════════════════════════════════════
echo.

cd /d "%~dp0"

REM Frontend build
echo 🔨 Frontend build ediliyor...
cd frontend
call npm run build
cd ..

REM Deploy klasörü
if exist "deploy\" rmdir /s /q deploy
mkdir deploy\frontend
mkdir deploy\backend

REM Kopyalama
echo 📋 Dosyalar kopyalanıyor...
xcopy /s /e /y /q frontend\dist\* deploy\frontend\ >nul
xcopy /s /e /y /q backend\*.* deploy\backend\ /EXCLUDE:exclude-files.txt >nul

REM .htaccess
(
echo ^<IfModule mod_rewrite.c^>
echo   RewriteEngine On
echo   RewriteRule ^\^api/^(.*^)$ http://localhost:3001/api/$1 [P,L]
echo   RewriteCond %%{REQUEST_FILENAME} !-f
echo   RewriteCond %%{REQUEST_FILENAME} !-d
echo   RewriteRule . /index.html [L]
echo ^</IfModule^>
) > deploy\frontend\.htaccess

echo.
echo ✅ TAMAMLANDI!
echo 📦 deploy/ klasörünü cPanel'e yükle
echo.
pause
