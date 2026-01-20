@echo off
echo Starting Pakistan Fraud Detector...
echo.

echo Installing frontend dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd backend
call pip install -r requirements.txt

echo.
echo Starting backend server...
start "Backend Server" cmd /k "python app.py"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend...
cd ..
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Press any key to exit...
pause > nul
