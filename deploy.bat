@echo off
echo 🚀 Deploying Zeta AI...
cd C:\Users\Azram\Desktop\zeta-ai
git add .
git commit -m "Auto deploy - %date% %time%"
git push origin main
echo ✅ Deploy complete!
pause