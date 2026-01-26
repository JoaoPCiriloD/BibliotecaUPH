# Catálogo de Livros Maçônicos

Este é um catálogo web de livros maçônicos que lê automaticamente os livros da pasta `Livros` do Calibre.

## 📚 Como Funciona

O sistema escaneia a pasta `Livros` procurando por arquivos `.opf` (metadados do Calibre) e `.jpg` (capas dos livros), gerando automaticamente um catálogo web navegável.

## 🚀 Como Usar

### 1. Gerar/Atualizar o Catálogo

Sempre que adicionar, remover ou modificar livros na pasta `Livros`, execute:

```bash
python3 scan-livros.py
```

Este script:
- Escaneia recursivamente a pasta `Livros`
- Lê os arquivos `metadata.opf` de cada livro
- Localiza as capas (`cover.jpg`)
- Localiza os arquivos dos livros (`.pdf`, `.epub`, `.mobi`)
- Gera o arquivo `catalogo.json` com todos os dados

### 2. Abrir o Site

Abra o arquivo `index.html` em um navegador web.

**Importante:** Para que as imagens e arquivos funcionem corretamente, você precisa servir o site através de um servidor web local:

#### Opção 1: Python (recomendado)
```bash
python3 -m http.server 8000
```
Depois acesse: http://localhost:8000

#### Opção 2: Node.js
```bash
npx http-server
```

#### Opção 3: VS Code
Use a extensão "Live Server" no VS Code

## 📁 Estrutura de Arquivos

```
Catalogo/
├── index.html          # Página principal
├── script.js           # Lógica do catálogo
├── style.css           # Estilos
├── scan-livros.py      # Script para gerar catálogo
├── catalogo.json       # Dados dos livros (gerado automaticamente)
└── Livros/            # Pasta com os livros do Calibre
    ├── Autor 1/
    │   └── Livro 1 (ID)/
    │       ├── metadata.opf
    │       ├── cover.jpg
    │       └── Livro.pdf
    └── Autor 2/
        └── Livro 2 (ID)/
            ├── metadata.opf
            ├── cover.jpg
            └── Livro.epub
```

## ✨ Funcionalidades

- ✅ **Busca por título ou autor**
- ✅ **Filtro por autor**
- ✅ **Ordenação por título ou autor**
- ✅ **Visualização de capas**
- ✅ **Download de livros** (quando disponíveis)
- ✅ **Detalhes dos livros**
- ✅ **Interface responsiva**

## 🔄 Atualizando o Catálogo

Sempre que modificar a pasta `Livros`:

1. Execute o script de scan:
   ```bash
   python3 scan-livros.py
   ```

2. Recarregue a página web (F5)

## 📝 Notas

- O script ignora automaticamente a pasta `.caltrash` (lixeira do Calibre)
- Livros sem capa mostrarão um placeholder colorido
- Livros sem arquivo disponível não terão botão de download
- O catálogo suporta formatos: PDF, EPUB e MOBI

## 🛠️ Requisitos

- Python 3.x (já incluído na maioria dos sistemas Linux/Mac)
- Navegador web moderno
- Servidor web local (para funcionar corretamente)
