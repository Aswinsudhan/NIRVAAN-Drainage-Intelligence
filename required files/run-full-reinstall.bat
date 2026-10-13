@echo off
cd /d "d:\NIRVAAN Drainage Intelligence"
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install > d:\temp-clean-install-out.log 2> d:\temp-clean-install-err.log
echo INSTALL_EXIT=%ERRORLEVEL% >> d:\temp-clean-install-out.log
