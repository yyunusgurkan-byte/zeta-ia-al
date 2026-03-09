@echo off
echo === BACKEND PUSH ===
cd /d C:\Users\Azram\Desktop\zeta-ai\backend
git add .
git commit -m "Backend guncellemesi - %date% %time%"
git push

echo === FRONTEND + ANA REPO PUSH ===
cd /d C:\Users\Azram\Desktop\zeta-ai
git add .
git commit -m "Guncelleme - %date% %time%"
git push

echo TUMU TAMAMLANDI!
pause