@echo off
cd /d "d:\NIRVAAN Drainage Intelligence"
call node_modules\.bin\tsc --noEmit > d:\temp-tsc-out.log 2> d:\temp-tsc-err.log
echo TSC_EXIT=%ERRORLEVEL% >> d:\temp-tsc-out.log
