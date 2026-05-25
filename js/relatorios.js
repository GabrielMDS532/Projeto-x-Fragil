/**
 * =========================================================================
 * 1. CONTROLE DE ACESSO E SEGURANÇA
 * =========================================================================
 */
function verificarAutenticacao() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = '../cadastro/login.html';
        return false;
    }
    return true;
}

/**
 * =========================================================================
 * 2. INICIALIZAÇÃO DA PÁGINA
 * =========================================================================
 */
function inicializarRelatorios() {
    if (!verificarAutenticacao()) return;

    // Carregar informações do cabeçalho/menu lateral
    const userEmail = localStorage.getItem('userEmail') || '';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Nível de acesso
    const btnUsuarios = document.getElementById('btnUsuarios');
    if (!isAdmin && btnUsuarios) {
        btnUsuarios.style.display = 'none';
    }

    const btnExportar = document.getElementById('btnExportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarRelatorio);
    }
}

/**
 * =========================================================================
 * 3. LÓGICA DE EXPORTAÇÃO E BUSCA DE DADOS (PRONTO PARA API)
 * =========================================================================
 */
async function exportarRelatorio() {
    const filtroDataInicio = document.getElementById('dataInicio')?.value || '';
    const filtroDataFim = document.getElementById('dataFim')?.value || '';

    const parametrosFiltro = {
        inicio: filtroDataInicio,
        fim: filtroDataFim
    };

    try {
        console.log("Solicitando geração de relatório com os filtros:", parametrosFiltro);
        alert('Relatório exportado com sucesso!');
    } catch (error) {
        console.error("Erro ao exportar o relatório:", error);
        alert("Houve um erro técnico ao gerar o arquivo de relatório.");
    }
}

/**
 * =========================================================================
 * 4. NAVEGAÇÃO E SESSÃO GLOBAIS
 * =========================================================================
 */
function navigate(page) {
    window.location.href = page;
}

function logout() {
    // Remoção estrita das chaves de sessão sem apagar os bancos de dados simulados!
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');

    window.location.href = '../cadastro/login.html';
}

// Inicializa o script
document.addEventListener('DOMContentLoaded', inicializarRelatorios);