@echo off
cd /d "d:\NIRVAAN Drainage Intelligence"
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build > d:\temp-fullbuild-out.log 2> d:\temp-fullbuild-err.log
echo BUILD_EXIT=%ERRORLEVEL% >> d:\temp-fullbuild-out.log
