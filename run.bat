@echo off
cd /d "%~dp0"

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm is not installed or not on PATH.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

curl.exe -fsS --max-time 2 http://127.0.0.1:5180/ >nul 2>nul
if not errorlevel 1 (
  echo.
  echo NIRVAAN is already running at http://localhost:5180/
  start "" "http://localhost:5180/"
  echo Close this window when finished.
  pause
  exit /b 0
)

for /f "delims=" %%P in ('powershell.exe -NoProfile -Command "$p=5180; while (Test-NetConnection -ComputerName 127.0.0.1 -Port $p -InformationLevel Quiet -WarningAction SilentlyContinue) { $p++ }; $p"') do set "PORT=%%P"

echo.
echo Starting NIRVAAN at http://localhost:%PORT%/
echo Close this window to stop the development server.
call npm.cmd run dev -- --host 0.0.0.0 --port %PORT%

echo.
echo The development server stopped.
pause
