@echo off
cd /d "d:\NIRVAAN Drainage Intelligence"
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" approve-scripts esbuild > d:\temp-approve-out.log 2> d:\temp-approve-err.log
echo APPROVE_EXIT=%ERRORLEVEL% >> d:\temp-approve-out.log
