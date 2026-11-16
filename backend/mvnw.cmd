@echo off
setlocal
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    mvn %*
) else if exist "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" (
    "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" %*
) else (
    echo [ERROR] Maven not found in PATH or standard directories. Please install Apache Maven.
    exit /b 1
)
