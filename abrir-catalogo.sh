#!/bin/bash

# Script para abrir o catálogo de livros
# Inicia o servidor HTTP e abre o navegador automaticamente

# Diretório do catálogo
CATALOGO_DIR="/media/joaopcirilod/Ella/Users/joaop/Downloads/Catalogo"
PORTA=8000
URL="http://localhost:$PORTA"

# Navega para o diretório do catálogo
cd "$CATALOGO_DIR" || exit 1

echo "🚀 Iniciando servidor HTTP na porta $PORTA..."
echo "📂 Diretório: $CATALOGO_DIR"
echo "🌐 URL: $URL"
echo ""

# Inicia o servidor HTTP em background
python3 -m http.server $PORTA &
SERVER_PID=$!

# Aguarda 2 segundos para o servidor iniciar
sleep 2

# Abre o navegador
echo "🌍 Abrindo navegador..."
if command -v xdg-open &> /dev/null; then
    xdg-open "$URL"
elif command -v gnome-open &> /dev/null; then
    gnome-open "$URL"
elif command -v firefox &> /dev/null; then
    firefox "$URL"
elif command -v google-chrome &> /dev/null; then
    google-chrome "$URL"
else
    echo "⚠️  Não foi possível abrir o navegador automaticamente."
    echo "   Por favor, abra manualmente: $URL"
fi

echo ""
echo "✅ Servidor rodando! Pressione Ctrl+C para parar."
echo ""

# Aguarda o processo do servidor
wait $SERVER_PID
