@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
color 0A
cls

echo.
echo ═══════════════════════════════════════════════════
echo    🚀 ZETA AI - BUILD ve DEPLOY
echo ═══════════════════════════════════════════════════
echo.

REM Proje dizinine git
cd /d "%~dp0"

REM Frontend klasörü var mı kontrol et
if not exist "frontend\" (
    echo ❌ HATA: frontend klasörü bulunamadı!
    echo 📁 Bu script'i zeta-ai klasörü içinde çalıştırmalısın.
    echo 💡 Şu anda şuradayız: %CD%
    echo.
    pause
    exit /b 1
)

echo 📁 Proje dizini: %CD%
echo.

REM ====================================
REM 1. FRONTEND BUILD
REM ====================================
echo ════════════════════════════════════════
echo 📦 ADIM 1: Frontend Build Ediliyor...
echo ════════════════════════════════════════
echo.

cd frontend

REM Node modules kontrolü
if not exist "node_modules\" (
    echo ⚠️  node_modules bulunamadı, npm install çalıştırılıyor...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install BAŞARISIZ!
        pause
        exit /b 1
    )
)

echo 🔨 npm run build çalıştırılıyor...
call npm run build

if errorlevel 1 (
    echo ❌ Build BAŞARISIZ!
    pause
    exit /b 1
)

echo ✅ Frontend build tamamlandı!
echo.

cd ..

REM ====================================
REM 2. DEPLOY KLASÖRÜ HAZIRLA
REM ====================================
echo ════════════════════════════════════════
echo 📂 ADIM 2: Deploy Klasörü Hazırlanıyor...
echo ════════════════════════════════════════
echo.

REM Eski deploy klasörünü sil
if exist "deploy\" (
    echo 🗑️  Eski deploy klasörü siliniyor...
    rmdir /s /q deploy
)

REM Yeni deploy klasörü oluştur
mkdir deploy
mkdir deploy\frontend
mkdir deploy\backend

echo ✅ Deploy klasörleri oluşturuldu!
echo.

REM ====================================
REM 3. FRONTEND DOSYALARINI KOPYALA
REM ====================================
echo ════════════════════════════════════════
echo 📋 ADIM 3: Frontend Dosyaları Kopyalanıyor...
echo ════════════════════════════════════════
echo.

xcopy /s /e /y frontend\dist\* deploy\frontend\

echo ✅ Frontend dosyaları kopyalandı!
echo.

REM ====================================
REM 4. BACKEND DOSYALARINI KOPYALA
REM ====================================
echo ════════════════════════════════════════
echo 📋 ADIM 4: Backend Dosyaları Kopyalanıyor...
echo ════════════════════════════════════════
echo.

REM Backend dosyalarını kopyala (node_modules hariç)
xcopy /s /e /y backend\*.* deploy\backend\ /EXCLUDE:exclude-files.txt

REM Eğer exclude dosyası yoksa, manuel olarak hariç tut
if not exist "exclude-files.txt" (
    for /d %%D in (backend\*) do (
        if not "%%~nxD"=="node_modules" (
            xcopy /s /e /y "%%D" "deploy\backend\%%~nxD\"
        )
    )
    xcopy /y backend\*.* deploy\backend\
)

echo ✅ Backend dosyaları kopyalandı!
echo.

REM ====================================
REM 5. .HTACCESS OLUŞTUR
REM ====================================
echo ════════════════════════════════════════
echo 📝 ADIM 5: .htaccess Oluşturuluyor...
echo ════════════════════════════════════════
echo.

(
echo ^<IfModule mod_rewrite.c^>
echo   RewriteEngine On
echo   RewriteBase /
echo.
echo   # Backend API proxy
echo   RewriteRule ^\^api/^(.*^)$ http://localhost:3001/api/$1 [P,L]
echo.
echo   # Frontend routing
echo   RewriteRule ^\^index\.html$ - [L]
echo   RewriteCond %%{REQUEST_FILENAME} !-f
echo   RewriteCond %%{REQUEST_FILENAME} !-d
echo   RewriteRule . /index.html [L]
echo ^</IfModule^>
) > deploy\frontend\.htaccess

echo ✅ .htaccess oluşturuldu!
echo.

REM ====================================
REM 6. ENVIRONMENT DOSYASI OLUŞTUR
REM ====================================
echo ════════════════════════════════════════
echo 🔐 ADIM 6: Environment Dosyası Hatırlatma
echo ════════════════════════════════════════
echo.

echo ⚠️  ÖNEMLI: deploy/backend/.env dosyasını oluşturmayı UNUTMA!
echo.
echo Şu bilgileri ekle:
echo PORT=3001
echo GROQ_API_KEY=gsk_your_actual_key_here
echo NODE_ENV=production
echo FRONTEND_URL=http://www.alzeta.site
echo.

REM ====================================
REM 7. README OLUŞTUR
REM ====================================
(
echo ZETA AI - DEPLOY PAKETİ
echo =======================
echo.
echo DEPLOY ADIMLAR:
echo.
echo 1. FRONTEND YÜKLEME:
echo    - deploy/frontend/* içindeki TÜM dosyaları
echo    - cPanel File Manager ^-^> httpdocs/ köküne yükle
echo.
echo 2. BACKEND YÜKLEME:
echo    - deploy/backend/ klasörünü
echo    - cPanel File Manager ^-^> httpdocs/backend olarak yükle
echo.
echo 3. ENVIRONMENT VARIABLES:
echo    - cPanel ^-^> Setup Node.js App
echo    - Environment variables ekle:
echo      * GROQ_API_KEY=gsk_...
echo      * PORT=3001
echo      * NODE_ENV=production
echo.
echo 4. NPM INSTALL:
echo    - cPanel Terminal veya SSH:
echo      cd ~/httpdocs/backend
echo      npm install
echo.
echo 5. START APP:
echo    - cPanel ^-^> Setup Node.js App ^-^> Start App
echo.
echo 6. TEST:
echo    - http://www.alzeta.site
) > deploy\DEPLOY_README.txt

echo ✅ Deploy talimatları oluşturuldu!
echo.

REM ====================================
REM 8. TAMAMLANDI
REM ====================================
echo.
echo ═══════════════════════════════════════════════════
echo    ✅ BUILD ve DEPLOY HAZIR!
echo ═══════════════════════════════════════════════════
echo.
echo 📦 Deploy klasörü: %CD%\deploy
echo.
echo 📁 İçindekiler:
echo    - frontend/  (httpdocs/ köküne yükle)
echo    - backend/   (httpdocs/backend olarak yükle)
echo    - DEPLOY_README.txt (talimatlar)
echo.
echo 🚀 ŞİMDİ NE YAPACAKSIN?
echo    1. deploy/backend/.env dosyası oluştur (GROQ_API_KEY ekle)
echo    2. deploy/ klasörünü cPanel'e yükle
echo    3. DEPLOY_README.txt dosyasındaki adımları takip et
echo.
echo ═══════════════════════════════════════════════════
echo.

pause
