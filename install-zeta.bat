<create_file>
<path>/mnt/user-data/outputs/install-zeta.bat</path>
<description>Zeta AI bağımlılıklarını yükleme</description>
<file_text>@echo off
title Zeta AI - Install
color 0B
echo.
echo ================================================
echo        ZETA AI KURULUM
echo ================================================
echo.
echo [1/2] Backend bagimliliklari yukleniyor...
cd /d %~dp0
call npm install
echo.
echo [2/2] Frontend bagimliliklari yukleniyor...
cd frontend
call npm install
cd ..
echo.
echo ================================================
echo   KURULUM TAMAMLANDI!
echo ================================================
echo.
echo Zeta AI'yi baslatmak icin start-zeta.bat dosyasini calistirin.
echo.
pause
</file_text>
</create_file>
<present_files>
<filepaths>
/mnt/user-data/outputs/start-zeta.bat
/mnt/user-data/outputs/stop-zeta.bat
/mnt/user-data/outputs/install-zeta.bat
</filepaths>
</present_files>