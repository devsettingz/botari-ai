@echo off
REM Set environment variables for Botari AI
REM Run this before migrations: set-env.bat

set DATABASE_URL=postgresql://postgres:password@localhost:5432/botari
set OPENAI_API_KEY=sk-your-openai-key-here
set JWT_SECRET=your-jwt-secret-change-this-in-production
set PORT=4000

echo Environment variables set!
echo.
echo Now run: run-migrations.bat
