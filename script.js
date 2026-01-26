/**
 * Biblioteca Digital - Script Principal
 * Gerencia o catálogo de livros, filtros, tema e interações da interface
 */

// ===== ESTADO DA APLICAÇÃO =====
let livros = [];
let livrosFiltrados = [];

// ===== CONSTANTES =====
const ELEMENTOS = {
    searchInput: () => document.getElementById('searchInput'),
    authorFilter: () => document.getElementById('authorFilter'),
    sortFilter: () => document.getElementById('sortFilter'),
    productGrid: () => document.getElementById('productGrid'),
    totalLivros: () => document.getElementById('totalLivros'),
    totalAutores: () => document.getElementById('totalAutores'),
    resultCount: () => document.getElementById('resultCount'),
    themeToggle: () => document.getElementById('themeToggle'),
    contactForm: () => document.getElementById('contactForm')
};

const PLACEHOLDER_CONFIG = {
    background: '4B1E6D',
    color: 'fff',
    size: 400,
    fontSize: 0.33
};

const TEMAS = {
    LIGHT: 'light',
    DARK: 'dark'
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', inicializarAplicacao);

function inicializarAplicacao() {
    carregarCatalogo();
    inicializarTema();
    inicializarEventos();
}

// ===== GERENCIAMENTO DE TEMA =====

/**
 * Inicializa o sistema de temas (claro/escuro)
 */
function inicializarTema() {
    const themeToggle = ELEMENTOS.themeToggle();
    const savedTheme = obterTemaSalvo();
    
    aplicarTema(savedTheme);
    themeToggle.addEventListener('click', alternarTema);
}

/**
 * Obtém o tema salvo no localStorage
 * @returns {string} Tema salvo ou tema padrão (light)
 */
function obterTemaSalvo() {
    return localStorage.getItem('theme') || TEMAS.LIGHT;
}

/**
 * Alterna entre tema claro e escuro
 */
function alternarTema() {
    const temaAtual = document.documentElement.getAttribute('data-bs-theme');
    const novoTema = temaAtual === TEMAS.LIGHT ? TEMAS.DARK : TEMAS.LIGHT;
    aplicarTema(novoTema);
    localStorage.setItem('theme', novoTema);
}

/**
 * Aplica um tema específico
 * @param {string} tema - Nome do tema (light ou dark)
 */
function aplicarTema(tema) {
    document.documentElement.setAttribute('data-bs-theme', tema);
    atualizarIconeTema(tema);
}

/**
 * Atualiza o ícone do botão de tema
 * @param {string} tema - Nome do tema atual
 */
function atualizarIconeTema(tema) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = tema === TEMAS.DARK ? 'bi bi-sun-fill' : 'bi bi-moon-stars';
}

// ===== INICIALIZAÇÃO DE EVENTOS =====

/**
 * Configura todos os event listeners da aplicação
 */
function inicializarEventos() {
    configurarEventosFiltros();
    configurarEventosNavbar();
    configurarEventosSmoothScroll();
    configurarEventosFormulario();
}

/**
 * Configura eventos dos filtros de pesquisa e ordenação
 */
function configurarEventosFiltros() {
    const searchInput = ELEMENTOS.searchInput();
    const authorFilter = ELEMENTOS.authorFilter();
    const sortFilter = ELEMENTOS.sortFilter();
    
    if (searchInput) searchInput.addEventListener('input', filtrarLivros);
    if (authorFilter) authorFilter.addEventListener('change', filtrarLivros);
    if (sortFilter) sortFilter.addEventListener('change', ordenarLivros);
}

/**
 * Configura eventos da navbar (scroll)
 */
function configurarEventosNavbar() {
    window.addEventListener('scroll', handleNavbarScroll);
}

/**
 * Manipula o scroll da navbar
 */
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
}

/**
 * Configura smooth scroll para links internos
 */
function configurarEventosSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
}

/**
 * Manipula o smooth scroll
 * @param {Event} e - Evento de click
 */
function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const target = document.querySelector(targetId);
    
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Configura eventos do formulário de contato
 */
function configurarEventosFormulario() {
    const contactForm = ELEMENTOS.contactForm();
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * Manipula o envio do formulário
 * @param {Event} e - Evento de submit
 */
function handleFormSubmit(e) {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! (Funcionalidade de demonstração)');
    e.target.reset();
}

// ===== CARREGAMENTO DE DADOS =====

/**
 * Carrega e processa o catálogo de livros do arquivo JSON
 */
async function carregarCatalogo() {
    try {
        const response = await fetch('catalogo.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        
        livros = await response.json();
        livrosFiltrados = [...livros];
        
        console.log(`✓ Catálogo carregado: ${livros.length} livros`);
        
        atualizarEstatisticas();
        renderizarLivros(livros);
        preencherAutores(livros);
        atualizarContador(livros.length);
    } catch (error) {
        console.error('✗ Erro ao carregar catálogo:', error);
        exibirErroCarregamento();
    }
}

/**
 * Atualiza as estatísticas exibidas na hero section
 */
function atualizarEstatisticas() {
    const totalLivrosEl = ELEMENTOS.totalLivros();
    const totalAutoresEl = ELEMENTOS.totalAutores();
    
    if (totalLivrosEl) totalLivrosEl.textContent = livros.length;
    
    if (totalAutoresEl) {
        const autoresUnicos = new Set(livros.map(l => l.autor).filter(Boolean));
        totalAutoresEl.textContent = autoresUnicos.size;
    }
}

/**
 * Exibe mensagem de erro quando falha o carregamento do catálogo
 */
function exibirErroCarregamento() {
    const productGrid = ELEMENTOS.productGrid();
    if (!productGrid) return;
    productGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger shadow" role="alert">
                    <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block"></i>
                    <h4>Erro ao carregar o catálogo</h4>
                    <p>Verifique se o arquivo "catalogo.json" foi gerado corretamente.</p>
                    <code class="d-block mt-3 p-2 bg-dark text-white rounded">python3 scan-livros.py</code>
                </div>
            </div>
        `;
}

// ===== RENDERIZAÇÃO =====

/**
 * Renderiza a lista de livros na página
 * @param {Array} livrosParaExibir - Array de livros a serem exibidos
 */
function renderizarLivros(livrosParaExibir) {
    const productGrid = ELEMENTOS.productGrid();
    if (!productGrid) return;
    
    if (livrosParaExibir.length === 0) {
        exibirMensagemVazia(productGrid);
        return;
    }
    productGrid.innerHTML = livrosParaExibir.map((livro, index) => 
        criarCardLivro(livro, index)
    ).join('');
    
    atualizarContador(livrosParaExibir.length);
}

/**
 * Exibe mensagem quando nenhum livro é encontrado
 * @param {HTMLElement} container - Elemento container
 */
function exibirMensagemVazia(container) {
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <p class="text-muted fs-5">Nenhum livro encontrado com os filtros selecionados.</p>
        </div>
    `;
}

/**
 * Cria o HTML de um card de livro
 * @param {Object} livro - Dados do livro
 * @param {number} index - Índice do livro no array
 * @returns {string} HTML do card
 */
function criarCardLivro(livro, index) {
    const titulo = livro.titulo || 'Título não disponível';
    const autor = livro.autor || 'Autor desconhecido';
    const descricao = limparDescricao(livro.descricao);
    const imagemUrl = obterUrlImagem(livro.capa, titulo);
    
    return `
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 product-item">
            <div class="card product-card h-100 shadow-sm">
                <img src="${imagemUrl}" 
                     class="card-img-top" 
                     alt="${titulo}"
                     style="cursor: pointer;"
                     onclick='ampliarImagem("${imagemUrl}", "${escaparTexto(titulo)}")'
                     onerror="this.src='${obterUrlPlaceholder(titulo)}'">                    <div class="card-body d-flex flex-column">
                        <span class="author-badge">
                            <i class="bi bi-person-fill me-1"></i>${autor}
                        </span>
                        <h5 class="card-title">${titulo}</h5>
                        <p class="card-text text-muted small">${truncarTexto(descricao, 100)}</p>
                        <div class="mt-auto">
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="abrirDetalhes(${index})">
                                    <i class="bi bi-info-circle me-2"></i>Ver Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    `;
}

/**
 * Remove tags HTML e espaços extras da descrição
 * @param {string} descricaoHtml - Descrição com HTML
 * @returns {string} Descrição limpa
 */
function limparDescricao(descricaoHtml) {
    const texto = descricaoHtml || 'Sem descrição disponível';
    return texto.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Obtém a URL da imagem (capa ou placeholder)
 * @param {string} capa - Caminho da capa
 * @param {string} titulo - Título do livro
 * @returns {string} URL da imagem
 */
function obterUrlImagem(capa, titulo) {
    return capa || obterUrlPlaceholder(titulo);
}

/**
 * Gera URL de placeholder personalizado
 * @param {string} texto - Texto para o placeholder
 * @returns {string} URL do placeholder
 */
function obterUrlPlaceholder(texto) {
    const { background, color, size, fontSize } = PLACEHOLDER_CONFIG;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(texto)}&size=${size}&background=${background}&color=${color}&font-size=${fontSize}`;
}

/**
 * Trunca texto adicionando reticências se necessário
 * @param {string} texto - Texto a ser truncado
 * @param {number} limite - Limite de caracteres
 * @returns {string} Texto truncado
 */
function truncarTexto(texto, limite) {
    return texto.length > limite ? `${texto.substring(0, limite)}...` : texto;
}

/**
 * Escapa aspas simples em texto para uso em atributos HTML
 * @param {string} texto - Texto a ser escapado
 * @returns {string} Texto escapado
 */
function escaparTexto(texto) {
    return texto.replace(/'/g, "\\'" );
}

/**
 * Atualiza o contador de livros exibidos
 * @param {number} total - Número total de livros
 */
function atualizarContador(total) {
    const counter = ELEMENTOS.resultCount();
    if (counter) {
        const texto = total === 1 ? 'livro' : 'livros';
        counter.textContent = `${total} ${texto}`;
    }
}

/**
 * Preenche o select de autores com opções únicas e ordenadas
 * @param {Array} livros - Array de livros
 */
function preencherAutores(livros) {
    const authorFilter = ELEMENTOS.authorFilter();
    if (!authorFilter) return;
    
    const autoresUnicos = obterAutoresUnicos(livros);
    
    authorFilter.innerHTML = '<option value="">Todos os Autores</option>';
    autoresUnicos.forEach(autor => {
        const option = document.createElement('option');
        option.value = autor;
        option.textContent = autor;
        authorFilter.appendChild(option);
    });
}

/**
 * Extrai lista de autores únicos e ordenados
 * @param {Array} livros - Array de livros
 * @returns {Array} Array de autores ordenados
 */
function obterAutoresUnicos(livros) {
    const autores = livros.map(l => l.autor || 'Autor desconhecido');
    return [...new Set(autores)].sort();
}

// ===== FILTRAGEM E ORDENAÇÃO =====

/**
 * Filtra livros baseado nos critérios de busca e autor
 */
function filtrarLivros() {
    const searchInput = ELEMENTOS.searchInput();
    const authorFilter = ELEMENTOS.authorFilter();
    const sortFilter = ELEMENTOS.sortFilter();
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedAuthor = authorFilter.value;
    
    livrosFiltrados = livros.filter(livro => 
        correspondeAoFiltro(livro, searchTerm, selectedAuthor)
    );
    
    if (sortFilter.value) {
        aplicarOrdenacao();
    } else {
        renderizarLivros(livrosFiltrados);
    }
}

/**
 * Verifica se um livro corresponde aos critérios de filtro
 * @param {Object} livro - Dados do livro
 * @param {string} searchTerm - Termo de busca
 * @param {string} selectedAuthor - Autor selecionado
 * @returns {boolean} true se corresponde aos filtros
 */
function correspondeAoFiltro(livro, searchTerm, selectedAuthor) {
    const titulo = (livro.titulo || '').toLowerCase();
    const autor = livro.autor || '';
    const descricao = (livro.descricao || '').toLowerCase();
    
    const matchesSearch = titulo.includes(searchTerm) || 
                         autor.toLowerCase().includes(searchTerm) ||
                         descricao.includes(searchTerm);
    const matchesAuthor = !selectedAuthor || autor === selectedAuthor;
    
    return matchesSearch && matchesAuthor;
}

/**
 * Ordena os livros filtrados
 */
function ordenarLivros() {
    aplicarOrdenacao();
}

/**
 * Aplica ordenação baseada no valor selecionado
 */
function aplicarOrdenacao() {
    const sortValue = ELEMENTOS.sortFilter().value;
    
    if (!sortValue) {
        renderizarLivros(livrosFiltrados);
        return;
    }
    
    const livrosOrdenados = [...livrosFiltrados].sort(
        obterFuncaoOrdenacao(sortValue)
    );
    
    renderizarLivros(livrosOrdenados);
}

/**
 * Retorna a função de comparação baseada no tipo de ordenação
 * @param {string} tipo - Tipo de ordenação ('titulo' ou 'autor')
 * @returns {Function} Função de comparação
 */
function obterFuncaoOrdenacao(tipo) {
    const ordenacoes = {
        'titulo': (a, b) => (a.titulo || '').localeCompare(b.titulo || ''),
        'autor': (a, b) => (a.autor || '').localeCompare(b.autor || '')
    };
    
    return ordenacoes[tipo] || ((a, b) => 0);
}

// ===== MODAL DE DETALHES =====

/**
 * Abre modal com detalhes do livro
 * @param {number} index - Índice do livro
 */
function abrirDetalhes(index) {
    const livro = livrosFiltrados[index] || livros[index];
    if (!livro) return;
    
    preencherModal(livro);
    exibirModal();
}

/**
 * Preenche o modal com informações do livro
 * @param {Object} livro - Dados do livro
 */
function preencherModal(livro) {
    document.getElementById('modalTitulo').textContent = 
        livro.titulo || 'Título não disponível';
    
    document.getElementById('modalAutor').textContent = 
        livro.autor || 'Autor desconhecido';
    
    const descricaoLimpa = limparDescricao(livro.descricao);
    document.getElementById('modalDescricao').textContent = descricaoLimpa;
    
    configurarCapaModal(livro);
}

/**
 * Configura a imagem da capa no modal
 * @param {Object} livro - Dados do livro
 */
function configurarCapaModal(livro) {
    const imagemUrl = obterUrlImagem(livro.capa, livro.titulo);
    const modalCapa = document.getElementById('modalCapa');
    
    modalCapa.src = imagemUrl;
    modalCapa.style.cursor = 'pointer';
    modalCapa.onclick = () => ampliarImagem(imagemUrl, livro.titulo);
}

/**
 * Exibe o modal de detalhes
 */
function exibirModal() {
    const modal = new bootstrap.Modal(document.getElementById('bookModal'));
    modal.show();
}

// ===== VISUALIZAÇÃO DE IMAGEM =====

/**
 * Amplia a imagem em tela cheia com overlay
 * @param {string} imagemUrl - URL da imagem
 * @param {string} titulo - Título para exibição
 */
function ampliarImagem(imagemUrl, titulo) {
    const overlay = criarOverlay();
    const container = criarContainerImagem();
    const img = criarImagemAmpliada(imagemUrl, titulo);
    const closeBtn = criarBotaoFechar();
    const titleDiv = criarTituloImagem(titulo);
    
    montarOverlay(overlay, container, img, closeBtn, titleDiv);
    aplicarAnimacao(overlay);
    configurarEventosOverlay(overlay, closeBtn);
}

/**
 * Cria o elemento overlay
 * @returns {HTMLElement} Elemento overlay
 */
function criarOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'imageOverlay';
    overlay.id = 'imageOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: zoom-out;
    `;
    return overlay;
}

/**
 * Cria o container da imagem
 * @returns {HTMLElement} Container
 */
/**
 * Cria o container da imagem
 * @returns {HTMLElement} Container
 */
function criarContainerImagem() {
    const container = document.createElement('div');
    container.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        position: relative;
    `;
    return container;
}

/**
 * Cria a imagem ampliada
 * @param {string} url - URL da imagem
 * @param {string} alt - Texto alternativo
 * @returns {HTMLElement} Elemento de imagem
 */
function criarImagemAmpliada(url, alt) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = alt;
    img.style.cssText = `
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    return img;
}

/**
 * Cria o botão de fechar
 * @returns {HTMLElement} Botão
 */
function criarBotaoFechar() {
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    closeBtn.style.cssText = `
        position: absolute;
        top: -15px;
        right: -15px;
        background: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    return closeBtn;
}

/**
 * Cria o título da imagem
 * @param {string} titulo - Título
 * @returns {HTMLElement} Div do título
 */
function criarTituloImagem(titulo) {
    const titleDiv = document.createElement('div');
    titleDiv.textContent = titulo;
    titleDiv.style.cssText = `
        position: absolute;
        bottom: -50px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 18px;
        font-weight: 600;
        text-align: center;
        max-width: 100%;
    `;
    return titleDiv;
}

/**
 * Mostra a imagem em tela cheia
 * @param {string} imagemUrl - URL da imagem
 * @param {string} titulo - Título da imagem
 */
function mostrarImagemAmpliada(imagemUrl, titulo) {
    const overlay = criarOverlay();
    const container = criarContainerImagem();
    const img = criarImagemAmpliada(imagemUrl, titulo);
    const closeBtn = criarBotaoFechar();
    const titleDiv = criarTituloImagem(titulo);
    
    // Montar estrutura
    container.appendChild(img);
    container.appendChild(closeBtn);
    container.appendChild(titleDiv);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Adicionar animação de entrada
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '1';
    }, 10);
    
    // Fechar ao clicar
    const fecharOverlay = () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    };
    
    overlay.addEventListener('click', fecharOverlay);
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fecharOverlay();
    });
    
    // Fechar com ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            fecharOverlay();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}