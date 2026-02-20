@echo off
cd /d C:\Users\Azram\Desktop\zeta-ai
git add .
git commit -m "Guncelleme - %date% %time%"
git push
echo PUSH TAMAMLANDI!
pause