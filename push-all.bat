@echo off

echo === BACKEND PUSH ===
cd /d C:\Users\Azram\Desktop\zeta-ai-backend
git add .
git commit -m "Guncelleme - %date% %time%"
git push

echo === FRONTEND PUSH ===
cd /d C:\Users\Azram\Desktop\zeta-ai\frontend
git add .
git commit -m "Guncelleme - %date% %time%"
git push

echo TUMU TAMAMLANDI!
pause