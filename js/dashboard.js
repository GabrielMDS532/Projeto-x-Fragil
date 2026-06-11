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
 * 2. LOGICA PRINCIPAL DA DASHBOARD
 * =========================================================================
 */
function inicializarDashboard() {
    if (!verificarAutenticacao()) return;

    // Recupera os dados do usuário logado do localStorage
    const userEmail = localStorage.getItem('userEmail') || '';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const welcomeElement = document.getElementById('welcomeMessage');
    const userInfoElement = document.getElementById('userInfo');

    if (welcomeElement) welcomeElement.textContent = `Olá, ${userDisplayNameFormated}!`;
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Controle de Nível de Acesso (Admin vs Usuário Comum)
    configurarNivelAcesso(isAdmin);

    // Carrega dados reais da dashboard
    carregarDadosDashboard();
}

function configurarNivelAcesso(isAdmin) {
    const btnUsuarios = document.getElementById('btnUsuarios');
    const quickAccessUsuarios = document.getElementById('quickAccessUsuarios');

    if (!isAdmin) {
        if (btnUsuarios) btnUsuarios.style.display = 'none';
        if (quickAccessUsuarios) quickAccessUsuarios.style.display = 'none';
    }
}

async function carregarDadosDashboard() {
    try {
        const resposta = await fetch('http://localhost:3000/api/dashboard/stats', { credentials: 'include' });
        const dados = await resposta.json();

        if (dados.sucesso) {
            // Seletor dos elementos de métrica
            const c1 = document.querySelector('.contagem_1');
            const c2 = document.querySelector('.contagem_2');
            const c3 = document.querySelector('.contagem_3');
            const c4 = document.querySelector('.contagem_4');

            if (c1) c1.textContent = dados.total_pacientes;
            if (c2) c2.textContent = dados.total_relatorios;
            if (c3) c3.textContent = dados.total_encaminhamentos;
            if (c4) c4.textContent = dados.total_recentes;

            // Renderiza tabela com os 5 relatórios mais recentes
            renderizarTabelaRecentes(dados.recentes);
        }
    } catch (error) {
        console.error("Erro ao buscar dados para a dashboard:", error);
    }
}

function renderizarTabelaRecentes(lista) {
    const tbody = document.getElementById('recentEvaluationsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #64748b; padding: 20px;">Nenhuma avaliação registrada no momento.</td></tr>`;
        return;
    }

    lista.forEach(item => {
        const tr = document.createElement('tr');
        
        const dataOriginal = new Date(item.data_relatorio);
        const dataFormatada = dataOriginal.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        const scoreFormatado = (item.score_relatorio / 100).toFixed(2);
        
        const badgeClass = item.resultado_relatorio === 'RECOMENDADO' ? 'badge badge-danger' : 'badge badge-success';
        const textoResultado = item.resultado_relatorio === 'RECOMENDADO' ? 'Encaminhamento' : 'Normal';

        tr.innerHTML = `
            <td><strong>${item.nome_paciente}</strong></td>
            <td>${dataFormatada}</td>
            <td><strong>${scoreFormatado}</strong></td>
            <td><span class="${badgeClass}">${textoResultado}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * =========================================================================
 * 4. FUNÇÕES GLOBAIS DE NAVEGAÇÃO E SESSÃO
 * =========================================================================
 */
function navigate(page) {
    window.location.href = page;
}

function logout() {
    encerrarSessao('../cadastro/login.html');
}

// Inicializa tudo automaticamente
document.addEventListener('DOMContentLoaded', inicializarDashboard);