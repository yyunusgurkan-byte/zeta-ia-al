@echo off
title Zeta AI - Hosting Build (Full Auto)
color 0B

echo ================================================
echo      ZETA AI HOSTING HAZIRLANIYOR
echo ================================================
echo.

echo [1/5] Frontend build yapiliyor...
cd frontend
call npm run build
cd ..

echo.
echo [2/5] Upload klasoru temizleniyor...
if exist "upload" rmdir /s /q "upload"
mkdir upload

echo.
echo [3/5] Dosyalar kopyalaniyor...
REM Frontend dosyalari
xcopy /E /I /Y "frontend\dist\*" "upload\"

REM Backend dosyalari
mkdir "upload\api"
xcopy /E /I /Y "backend\*" "upload\api\"
if exist "upload\api\node_modules" rmdir /s /q "upload\api\node_modules"

echo.
echo [4/5] Otomatik Yapilandirma Dosyalari Olusturuluyor...

REM --- KRITIK: SUNUCU .ENV DOSYASI ---
(
echo PORT=3001
echo FRONTEND_URL=http://www.alzeta.site
echo NODE_ENV=production
) > "upload\api\.env"

REM --- KRITIK: FRONTEND CONFIG KLASORU VE DOSYASI ---
mkdir "upload\config" 2>nul
(
echo export const config = {
echo   API_URL: "http://www.alzeta.site/api"
echo };
echo export default config;
) > "upload\config\config.js"

REM --- PLESK STARTUP (app.js) ---
(
echo require('./api/server.js');
) > upload\app.js

echo.
echo [5/5] package.json hazirlaniyor...
(
echo {
echo   "name": "zeta-ai-fullstack",
echo   "version": "1.0.0",
echo   "main": "app.js",
echo   "scripts": {
echo     "start": "node app.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "cors": "^2.8.5",
echo     "dotenv": "^16.3.1",
echo     "axios": "^1.6.2",
echo     "express-rate-limit": "^7.1.5"
echo   },
echo   "engines": {
echo     "node": ">=18.0.0"
echo   }
echo }
) > upload\package.json

echo.
echo ================================================
echo   ISLEM TAMAM! 
echo.
echo   YAPMAN GEREKENLER:
echo   1. "upload" icindekileri Plesk httpdocs'a yukle.
echo   2. Plesk Node.js panelinde "NPM Kurulumu"na bas.
echo   3. "Uygulamayi Yeniden Baslat"a bas.
echo ================================================
echo.
pause