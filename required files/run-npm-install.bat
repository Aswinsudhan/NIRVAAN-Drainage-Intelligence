@echo off
cd /d "d:\NIRVAAN Drainage Intelligence"
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install > d:\temp-npm2-out.log 2> d:\temp-npm2-err.log
echo NPM_EXIT=%ERRORLEVEL% >> d:\temp-npm2-out.log
