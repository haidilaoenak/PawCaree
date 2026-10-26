@echo off
title PawCare Dev Server
echo.
echo  ==========================================
echo   PawCare - Starting Local Dev Server...
echo  ==========================================
echo.
echo  Website akan tersedia di:
echo  http://localhost:3000
echo.
echo  Tekan Ctrl+C untuk menghentikan server.
echo  ==========================================
echo.
start "" "http://localhost:3000"
npx serve . -l 3000
pause
