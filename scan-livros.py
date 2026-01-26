#!/usr/bin/env python3
import os
import json
import xml.etree.ElementTree as ET
from pathlib import Path

LIVROS_PATH = Path(__file__).parent / 'Livros'
OUTPUT_FILE = Path(__file__).parent / 'catalogo.json'

def buscar_arquivos_opf(diretorio):
    """Busca recursivamente todos os arquivos metadata.opf"""
    arquivos_opf = []
    
    for root, dirs, files in os.walk(diretorio):
        # Ignorar pasta .caltrash
        if '.caltrash' in root:
            continue
            
        if 'metadata.opf' in files:
            arquivos_opf.append(Path(root) / 'metadata.opf')
    
    return arquivos_opf

def processar_opf(caminho_opf):
    """Extrai informações do arquivo OPF"""
    try:
        tree = ET.parse(caminho_opf)
        root = tree.getroot()
        
        # Namespace do OPF
        ns = {
            'opf': 'http://www.idpf.org/2007/opf',
            'dc': 'http://purl.org/dc/elements/1.1/'
        }
        
        # Extrair metadados
        metadata = root.find('opf:metadata', ns)
        
        titulo = metadata.find('dc:title', ns)
        titulo_texto = titulo.text if titulo is not None else 'Título desconhecido'
        
        autor = metadata.find('dc:creator', ns)
        autor_texto = autor.text if autor is not None else 'Autor desconhecido'
        
        # Buscar descrição
        descricao = metadata.find('dc:description', ns)
        descricao_texto = descricao.text if descricao is not None else ''
        
        # Buscar ID do Calibre
        calibre_id = ''
        for identifier in metadata.findall('dc:identifier', ns):
            if identifier.get('{http://www.idpf.org/2007/opf}scheme') == 'calibre':
                calibre_id = identifier.text
                break
        
        # Diretório do livro
        dir_livro = caminho_opf.parent
        
        # Buscar capa
        caminho_capa = dir_livro / 'cover.jpg'
        capa_relativa = None
        if caminho_capa.exists():
            # Usar caminho relativo ao diretório do script
            capa_relativa = str(caminho_capa.relative_to(LIVROS_PATH.parent)).replace('\\', '/')
        
        # Buscar arquivo do livro (PDF, EPUB, MOBI)
        arquivo_livro = None
        for arquivo in dir_livro.iterdir():
            if arquivo.suffix.lower() in ['.pdf', '.epub', '.mobi']:
                # Usar caminho relativo ao diretório do script
                arquivo_livro = str(arquivo.relative_to(LIVROS_PATH.parent)).replace('\\', '/')
                break
        
        # Pasta do autor (diretório pai)
        pasta_autor = dir_livro.parent.name
        
        return {
            'titulo': titulo_texto,
            'autor': autor_texto,
            'descricao': descricao_texto,
            'calibreId': calibre_id,
            'capa': capa_relativa,
            'arquivo': arquivo_livro,
            'pdf': arquivo_livro,
            'pastaAutor': pasta_autor,
            'caminhoPasta': str(dir_livro.relative_to(Path.cwd())).replace('\\', '/')
        }
        
    except Exception as e:
        print(f"Erro ao processar {caminho_opf}: {e}")
        return None

def gerar_catalogo():
    """Função principal"""
    print("Escaneando pasta Livros...")
    
    arquivos_opf = buscar_arquivos_opf(LIVROS_PATH)
    print(f"Encontrados {len(arquivos_opf)} livros")
    
    livros = []
    
    for i, opf in enumerate(arquivos_opf, 1):
        if i % 50 == 0:
            print(f"Processando livro {i}/{len(arquivos_opf)}...")
        
        dados = processar_opf(opf)
        if dados:
            livros.append(dados)
    
    # Ordenar por título
    livros.sort(key=lambda x: x['titulo'].lower())
    
    # Salvar JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(livros, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Catálogo gerado com sucesso: {len(livros)} livros")
    print(f"✓ Arquivo salvo em: {OUTPUT_FILE}")

if __name__ == '__main__':
    gerar_catalogo()
