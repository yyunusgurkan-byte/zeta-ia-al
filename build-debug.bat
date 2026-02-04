@echo off
echo.
echo ========================================
echo ZETA AI - BUILD SCRIPT (DEBUG MODE)
echo ========================================
echo.

REM Şu anki dizini göster
echo [1/10] Konum kontrol ediliyor...
echo Su anki dizin: %CD%
echo.
pause

REM Frontend var mı?
echo [2/10] Frontend klasoru kontrol ediliyor...
if exist "frontend\" (
    echo ✓ frontend klasoru BULUNDU
) else (
    echo X frontend klasoru BULUNAMADI!
    echo HATA: Bu script'i zeta-ai klasoru icinde calistirmalisin!
    pause
    exit /b 1
)
echo.
pause

REM Backend var mı?
echo [3/10] Backend klasoru kontrol ediliyor...
if exist "backend\" (
    echo ✓ backend klasoru BULUNDU
) else (
    echo X backend klasoru BULUNAMADI!
    pause
    exit /b 1
)
echo.
pause

REM Frontend dizinine gir
echo [4/10] Frontend dizinine giriliyor...
cd frontend
echo Su an burdayiz: %CD%
echo.
pause

REM package.json var mı?
echo [5/10] package.json kontrol ediliyor...
if exist "package.json" (
    echo ✓ package.json BULUNDU
) else (
    echo X package.json BULUNAMADI!
    pause
    exit /b 1
)
echo.
pause

REM node_modules var mı?
echo [6/10] node_modules kontrol ediliyor...
if exist "node_modules\" (
    echo ✓ node_modules BULUNDU
) else (
    echo ! node_modules BULUNAMADI
    echo npm install calistiriliyor...
    call npm install
    if errorlevel 1 (
        echo X npm install BASARISIZ!
        pause
        exit /b 1
    )
)
echo.
pause

REM Build
echo [7/10] npm run build calistiriliyor...
call npm run build
if errorlevel 1 (
    echo X Build BASARISIZ!
    pause
    exit /b 1
)
echo ✓ Build TAMAMLANDI
echo.
pause

REM Geri dön
cd ..
echo [8/10] Ana dizine donuluyor...
echo Su an burdayiz: %CD%
echo.
pause

REM Deploy klasörü
echo [9/10] Deploy klasoru olusturuluyor...
if exist "deploy\" (
    rmdir /s /q deploy
    echo ✓ Eski deploy klasoru silindi
)
mkdir deploy
mkdir deploy\frontend
mkdir deploy\backend
echo ✓ Deploy klasoru olusturuldu
echo.
pause

REM Dosyaları kopyala
echo [10/10] Dosyalar kopyalaniyor...
echo.
echo Frontend dosyalari...
xcopy /s /e /y /i frontend\dist\* deploy\frontend\
echo.
echo Backend dosyalari...
xcopy /s /e /y /i backend\* deploy\backend\ /EXCLUDE:exclude-files.txt
echo.

REM .htaccess oluştur
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
echo ========================================
echo ✓✓✓ TAMAMLANDI! ✓✓✓
echo ========================================
echo.
echo Deploy klasoru: %CD%\deploy
echo.
echo SONRAKI ADIMLAR:
echo 1. deploy/backend/.env dosyasi olustur (GROQ_API_KEY ekle)
echo 2. deploy/ klasorunu cPanel'e yukle
echo 3. CPANEL_DEPLOY_GUIDE.txt dosyasindaki talimatları takip et
echo.
pause
