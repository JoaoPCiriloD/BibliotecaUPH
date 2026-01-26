const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');

// Constantes de configuração
const LIVROS_PATH = path.join(__dirname, 'Livros');
const OUTPUT_FILE = path.join(__dirname, 'catalogo.json');
const METADATA_FILENAME = 'metadata.opf';
const COVER_FILENAME = 'cover.jpg';
const CALIBRE_TRASH_FOLDER = '.caltrash';
const SUPPORTED_FORMATS = ['.pdf', '.epub', '.mobi'];

/**
 * Busca recursivamente todos os arquivos metadata.opf na pasta especificada
 * @param {string} dir - Diretório raiz para busca
 * @param {Array<string>} arquivosEncontrados - Array acumulador de arquivos encontrados
 * @returns {Array<string>} Lista de caminhos completos dos arquivos metadata.opf
 */
function buscarArquivosOPF(dir, arquivosEncontrados = []) {
    const arquivos = fs.readdirSync(dir);
    
    for (const arquivo of arquivos) {
        if (arquivo === CALIBRE_TRASH_FOLDER) continue;
        
        const caminhoCompleto = path.join(dir, arquivo);
        const isDirectory = fs.statSync(caminhoCompleto).isDirectory();
        
        if (isDirectory) {
            buscarArquivosOPF(caminhoCompleto, arquivosEncontrados);
        } else if (arquivo === METADATA_FILENAME) {
            arquivosEncontrados.push(caminhoCompleto);
        }
    }
    
    return arquivosEncontrados;
}

/**
 * Extrai informações do livro a partir do arquivo metadata.opf
 * @param {string} caminhoOPF - Caminho completo para o arquivo metadata.opf
 * @returns {Promise<Object|null>} Objeto com dados do livro ou null em caso de erro
 */
async function processarOPF(caminhoOPF) {
    try {
        const xml = fs.readFileSync(caminhoOPF, 'utf8');
        const resultado = await parseStringPromise(xml);
        
        const metadata = resultado.package.metadata[0];
        const dirLivro = path.dirname(caminhoOPF);
        
        const titulo = extrairTitulo(metadata);
        const autor = extrairAutor(metadata);
        const calibreId = extrairCalibreId(metadata);
        
        const capaCaminho = buscarCapa(dirLivro);
        const livroArquivo = buscarArquivoLivro(dirLivro);
        const pastaAutor = path.basename(path.dirname(dirLivro));
        
        return {
            titulo,
            autor,
            calibreId,
            capa: capaCaminho,
            arquivo: livroArquivo,
            pastaAutor,
            caminhoPasta: path.relative(__dirname, dirLivro).replace(/\\/g, '/')
        };
    } catch (erro) {
        console.error(`Erro ao processar ${caminhoOPF}:`, erro.message);
        return null;
    }
}

/**
 * Extrai o título do metadata
 * @param {Object} metadata - Objeto metadata do arquivo OPF
 * @returns {string} Título do livro
 */
function extrairTitulo(metadata) {
    return metadata['dc:title'] ? metadata['dc:title'][0] : 'Título desconhecido';
}

/**
 * Extrai o autor do metadata
 * @param {Object} metadata - Objeto metadata do arquivo OPF
 * @returns {string} Nome do autor
 */
function extrairAutor(metadata) {
    return metadata['dc:creator'] 
        ? metadata['dc:creator'][0]._ || metadata['dc:creator'][0] 
        : 'Autor desconhecido';
}

/**
 * Extrai o ID do Calibre do metadata
 * @param {Object} metadata - Objeto metadata do arquivo OPF
 * @returns {string} ID do Calibre
 */
function extrairCalibreId(metadata) {
    return metadata['dc:identifier']?.find(id => id.$?.scheme === 'calibre')?.$?._ || '';
}

/**
 * Busca o arquivo de capa no diretório do livro
 * @param {string} dirLivro - Diretório do livro
 * @returns {string|null} Caminho relativo da capa ou null
 */
function buscarCapa(dirLivro) {
    const caminhoCompleto = path.join(dirLivro, COVER_FILENAME);
    return fs.existsSync(caminhoCompleto)
        ? normalizarCaminho(path.relative(__dirname, caminhoCompleto))
        : null;
}

/**
 * Busca o arquivo do livro (PDF, EPUB ou MOBI) no diretório
 * @param {string} dirLivro - Diretório do livro
 * @returns {string|null} Caminho relativo do arquivo ou null
 */
function buscarArquivoLivro(dirLivro) {
    const arquivos = fs.readdirSync(dirLivro);
    const arquivo = arquivos.find(f => 
        SUPPORTED_FORMATS.some(ext => f.endsWith(ext))
    );
    return arquivo 
        ? normalizarCaminho(path.relative(__dirname, path.join(dirLivro, arquivo)))
        : null;
}

/**
 * Normaliza o caminho substituindo barras invertidas por barras normais
 * @param {string} caminho - Caminho a ser normalizado
 * @returns {string} Caminho normalizado
 */
function normalizarCaminho(caminho) {
    return caminho.replace(/\\/g, '/');
}

/**
 * Função principal que gera o catálogo de livros
 */
async function gerarCatalogo() {
    console.log('Escaneando pasta Livros...');
    
    const arquivosOPF = buscarArquivosOPF(LIVROS_PATH);
    console.log(`Encontrados ${arquivosOPF.length} livros`);
    
    const livros = [];
    
    for (const opf of arquivosOPF) {
        const dados = await processarOPF(opf);
        if (dados) {
            livros.push(dados);
        }
    }
    
    // Ordenar por título
    livros.sort((a, b) => a.titulo.localeCompare(b.titulo));
    
    // Salvar JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(livros, null, 2), 'utf8');
    
    console.log(`✓ Catálogo gerado com sucesso: ${livros.length} livros`);
    console.log(`✓ Arquivo salvo em: ${OUTPUT_FILE}`);
}

// Executar
gerarCatalogo().catch(console.error);
