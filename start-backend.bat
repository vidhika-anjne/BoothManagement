@echo off
echo Killing any existing Java processes on port 8081...
taskkill /F /IM java.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo Starting Spring Boot backend...
cd /d "%~dp0backend"
.\mvnw spring-boot:run
