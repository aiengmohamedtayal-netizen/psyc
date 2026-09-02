@echo off
setlocal EnableExtensions
chcp 65001 >nul

cd /d "%~dp0"

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%CHAT BOT"
set "BACKEND_PORT=8000"
set "FRONTEND_PORT=5173"
set "PYTHON_EXE="
set "NPM_CMD="

if exist "backend\venv\Scripts\python.exe" (
    set "PYTHON_EXE=%ROOT%backend\venv\Scripts\python.exe"
    goto :found_python
)

call :find_python
:found_python
if not defined PYTHON_EXE (
    echo [ERROR] Python was not found.
    echo Install Python 3.10+ or configure Python in system PATH.
    pause
    exit /b 1
)

call :find_npm
:found_npm
if not defined NPM_CMD (
    echo [ERROR] npm was not found.
    echo Install Node.js so the frontend can run.
    pause
    exit /b 1
)

echo ========================================================
echo        Starting Stress AI Helper (Full Stack)
echo ========================================================
echo [1/3] Launching backend (FastAPI) and frontend (Vite)...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$backendDir = $env:BACKEND_DIR; " ^
    "$frontendDir = $env:FRONTEND_DIR; " ^
    "$pythonExe = $env:PYTHON_EXE; " ^
    "$npmCmd = $env:NPM_CMD; " ^
    "$backendLog = Join-Path $backendDir 'backend.log'; " ^
    "$backendErr = Join-Path $backendDir 'backend.err.log'; " ^
    "$frontendLog = Join-Path $frontendDir 'frontend.log'; " ^
    "$frontendErr = Join-Path $frontendDir 'frontend.err.log'; " ^
    "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(8000, 5173) } | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; " ^
    "Remove-Item $backendLog, $backendErr, $frontendLog, $frontendErr -ErrorAction SilentlyContinue; " ^
    "$backend = Start-Process -FilePath $pythonExe -ArgumentList '-m','uvicorn','main:app','--host','127.0.0.1','--port','8000' -WorkingDirectory $backendDir -RedirectStandardOutput $backendLog -RedirectStandardError $backendErr -PassThru; " ^
    "$frontend = Start-Process -FilePath $npmCmd -ArgumentList 'run','dev','--','--host','127.0.0.1','--port','5173','--strictPort' -WorkingDirectory $frontendDir -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendErr -PassThru; " ^
    "$backendReady = $false; " ^
    "$frontendReady = $false; " ^
    "for ($i = 0; $i -lt 40; $i++) { " ^
    "  Start-Sleep -Milliseconds 500; " ^
    "  $ports = @(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort); " ^
    "  if ($ports -contains 8000) { $backendReady = $true } " ^
    "  if ($ports -contains 5173) { $frontendReady = $true } " ^
    "  if ($backendReady -and $frontendReady) { break } " ^
    "} " ^
    "if (-not $backendReady) { Write-Error 'Backend failed to start'; exit 1 } " ^
    "if (-not $frontendReady) { Write-Error 'Frontend failed to start'; exit 1 } " ^
    "Write-Output ('BACKEND_PID=' + $backend.Id); " ^
    "Write-Output ('FRONTEND_PID=' + $frontend.Id)"

if errorlevel 1 (
    echo.
    echo [ERROR] Project services failed to initialize.
    echo Please check the log files:
    echo - %BACKEND_DIR%\backend.err.log
    echo - %BACKEND_DIR%\backend.log
    echo - %FRONTEND_DIR%\frontend.err.log
    echo - %FRONTEND_DIR%\frontend.log
    pause
    exit /b 1
)

echo [2/3] Services successfully initialized and verified:
echo   - Frontend: http://127.0.0.1:%FRONTEND_PORT%
echo   - Backend:  http://127.0.0.1:%BACKEND_PORT%
echo   - Swagger:  http://127.0.0.1:%BACKEND_PORT%/docs

echo [3/3] Opening Stress AI Helper in your default browser...
start "" "http://127.0.0.1:%FRONTEND_PORT%"

echo.
echo Stress AI is running. Keep this terminal open or close it when done.
pause
exit /b 0

:find_python
for %%P in (
    "%LocalAppData%\Programs\Python\Python313\python.exe"
    "%LocalAppData%\Programs\Python\Python312\python.exe"
    "%LocalAppData%\Programs\Python\Python311\python.exe"
    "%LocalAppData%\Programs\Python\Python310\python.exe"
    "%LocalAppData%\Programs\Python\Python39\python.exe"
) do (
    if exist %%~P (
        set "PYTHON_EXE=%%~P"
        goto :eof
    )
)

for /f "delims=" %%P in ('where.exe python 2^>nul') do (
    echo %%~fP | find /I "%SystemRoot%\System32\python" >nul
    if errorlevel 1 (
        set "PYTHON_EXE=%%~fP"
        goto :eof
    )
)
goto :eof

:find_npm
for /f "delims=" %%P in ('where.exe npm.cmd 2^>nul') do (
    set "NPM_CMD=%%~fP"
    goto :eof
)
for /f "delims=" %%P in ('where.exe npm 2^>nul') do (
    set "NPM_CMD=%%~fP"
    goto :eof
)
goto :eof
