@echo off
cd /d "d:\NIRVAAN Drainage Intelligence\node_modules\esbuild"
"C:\Program Files\nodejs\node.exe" install.js > d:\temp-esbuild-install.log 2>&1
echo ESBUILD_EXIT=%ERRORLEVEL% >> d:\temp-esbuild-install.log
