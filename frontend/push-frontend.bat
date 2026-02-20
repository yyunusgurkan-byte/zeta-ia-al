@echo off
echo ========================================
echo FRONTEND BUILD VE PUSH
echo ========================================
cd /d C:\Users\Azram\Desktop\zeta-ai\frontend
echo Onceki build siliniyor...
rmdir /s /q dist
echo Build baslatiliyor...
call npm run build
echo Build tamamlandi!
echo ========================================
echo Simdi dist klasorunu httpdocs'a yukleyin!
echo ========================================
pause