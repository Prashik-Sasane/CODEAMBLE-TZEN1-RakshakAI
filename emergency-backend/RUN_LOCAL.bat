@echo off
title Emergency Response System - Local Runner
echo ========================================================
echo Starting Emergency Response System...
echo ========================================================
echo.

:: Navigate to backend dir (project root)
cd /d "%~dp0"

:: Start the backend Flask server in a new window
echo [info] Launching Backend Server on http://localhost:5000...
start "Emergency Backend Server" cmd /k "python app.py"

:: Delay momentarily
timeout /t 2 /nobreak >nul

:: Start the frontend Vite server in a new window
echo [info] Launching Frontend Development Server on http://localhost:5173...
start "Emergency Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Both servers have been launched in separate windows!
echo - Flask Backend API: http://localhost:5000
echo - React Frontend UI: http://localhost:5173
echo.
echo Note: If Twilio is not configured, check the Backend window
echo for OTP codes printed in the console when logging in.
echo ========================================================
pause
