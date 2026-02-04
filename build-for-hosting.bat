@echo off
title Zeta AI - Hosting Build (Fixed)
color 0B

echo [1/5] Frontend build yapiliyor...
cd frontend
call npm run build
cd ..

echo [2/5] Upload klasoru temizleniyor...
if exist "upload" rmdir /s /q "upload"
mkdir upload

echo [3/5] Dosyalar kopyalaniyor...
REM Frontend dosyalari (dist klasorunden)
xcopy /E /I /Y "frontend\dist\*" "upload\"

REM Backend dosyalari - BILGISAYARINDAKI KLASOR ADI 'backend' ISE:
mkdir "upload\api"
xcopy /E /I /Y "backend\*" "upload\api\"
if exist "upload\api\node_modules" rmdir /s /q "upload\api\node_modules"

echo [4/5] Yapilandirma Dosyalari Olusturuluyor...

REM --- KRITIK DUZELTME: API ANAHTARINI BURAYA EKLE ---
(
echo PORT=3001
echo FRONTEND_URL=http://www.alzeta.site
echo NODE_ENV=production
echo OPENAI_API_KEY=sk-BURAYA_KENDI_ANAHTARINI_YAZ
) > "upload\api\.env"

REM --- KRITIK DUZELTME: app.js YOLU ---
(
echo require('./api/server.js');
) > upload\app.js

REM --- FRONTEND CONFIG ---
mkdir "upload\config" 2>nul
(
echo const config = {
echo   API_URL: "http://www.alzeta.site/api"
echo };
echo export default config;
) > "upload\config\config.js"

echo [5/5] package.json hazirlaniyor...
REM (Buradaki package.json içeriği aynı kalabilir)

echo ISLEM TAMAM! "upload" klasorunu yukle ve Restart et.
pause