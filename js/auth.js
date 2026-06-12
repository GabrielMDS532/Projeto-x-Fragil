// Define verificarAutenticacao globalmente para anular validações locais baseadas em localStorage
window.verificarAutenticacao = function() {
    return true;
};

// Interceptação global de fetch para tratar erros 401 (não autorizado / sessão expirada)
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    try {
        const response = await originalFetch(...args);
        if (response.status === 401) {
            // Se falhou e não é a verificação de sessão inicial, alerta e redireciona
            const url = args[0];
            const isSessaoCheck = typeof url === 'string' && (url.includes('/api/sessao') || url.includes('/api/login'));
            if (!isSessaoCheck) {
                alert('Sessão Expirada. Por favor, faça login novamente.');
                window.location.href = '../index.html';
            }
        }
        return response;
    } catch (error) {
        throw error;
    }
};

// Validação imediata de Sessão Real
(async function validarSessaoInicial() {
    try {
        const resposta = await fetch('/api/sessao', { credentials: 'include' });
        if (!resposta.ok) {
            window.location.href = '../index.html';
            return;
        }
        const dados = await resposta.json();
        if (!dados.sucesso) {
            window.location.href = '../index.html';
            return;
        }

        // Armazena e atualiza no localStorage
        localStorage.setItem('tipo_usuario', dados.usuario.tipo_usuario);
        localStorage.setItem('isAdmin', (dados.usuario.tipo_usuario === 'ADMIN').toString());

        // Se a página for usuarios.html e não for admin, bloqueia acesso
        if (window.location.pathname.includes('usuarios.html') && dados.usuario.tipo_usuario !== 'ADMIN') {
            alert('Acesso negado!');
            window.location.href = 'dashboard.html';
        }

        // Aplica lógica de visibilidade do menu após o carregamento do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', configurarMenuExibicao);
        } else {
            configurarMenuExibicao();
        }
    } catch (error) {
        console.error('Erro na validação da sessão:', error);
        window.location.href = '../index.html';
    }
})();

function configurarMenuExibicao() {
    const tipoUsuario = localStorage.getItem('tipo_usuario');
    if (tipoUsuario !== 'ADMIN') {
        const elementsToHide = document.querySelectorAll('a[href*="usuarios.html"], button[onclick*="usuarios.html"], #btnUsuarios, #quickAccessUsuarios');
        elementsToHide.forEach(el => {
            el.style.display = 'none';
        });
    }

    // Intercepta clique no logout para limpar chaves locais adicionais
    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/logout', { method: 'POST' });
            } catch (err) {
                console.error('Erro ao chamar logout:', err);
            }
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
}
