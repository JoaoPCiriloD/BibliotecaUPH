@echo off
REM Script para abrir o catálogo de livros no Windows
REM Inicia o servidor HTTP e abre o navegador automaticamente

SET PORTA=8000
SET URL=http://localhost:%PORTA%

echo.
echo ========================================
echo   CATALOGO DE LIVROS
echo ========================================
echo.
echo Iniciando servidor HTTP na porta %PORTA%...
echo URL: %URL%
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Abre o navegador
start "" "%URL%"

REM Aguarda 2 segundos
timeout /t 2 /nobreak >nul

REM Inicia o servidor HTTP
python -m http.server %PORTA%
