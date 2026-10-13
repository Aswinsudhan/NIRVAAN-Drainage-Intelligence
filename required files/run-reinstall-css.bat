@echo off
cd /d "d:\NIRVAAN Drainage Intelligence"
rmdir /s /q "node_modules\postcss" 2>nul
rmdir /s /q "node_modules\tailwindcss" 2>nul
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install > d:\temp-reinstall-out.log 2> d:\temp-reinstall-err.log
echo REINSTALL_EXIT=%ERRORLEVEL% >> d:\temp-reinstall-out.log
