/**
 * =========================================================================
 * 1. CONTROLE DE ACESSO E SEGURANÇA (APENAS ADMINISTRADORES)
 * =========================================================================
 */
function verificarAcessoAdmin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = '../cadastro/login.html';
        return false;
    }

    if (!isAdmin) {
        alert('Acesso negado! Apenas administradores podem gerenciar usuários.');
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

/**
 * =========================================================================
 * 2. CONFIGURAÇÕES E DADOS TEMPORÁRIOS DE SIMULAÇÃO (PRONTO PARA API)
 * =========================================================================
 */
let listaUsuarios = [];

// Dados temporários iniciais (apenas se o localStorage simulador de banco estiver vazio)
const USUARIOS_TEMPORARIOS_INICIAIS = [
    {
        id_usuario: 1,
        nome_usuario: "Carlos",
        sobrenome_usuario: "Silva",
        email: "admin@clinica.com",
        senha: "admin123",
        tipo_usuario: "ADMIN",
        data_criacao: new Date().toISOString()
    },
    {
        id_usuario: 2,
        nome_usuario: "Ana",
        sobrenome_usuario: "Santos",
        email: "ana@clinica.com",
        senha: "user123",
        tipo_usuario: "USUARIO",
        data_criacao: new Date().toISOString()
    }
];

function inicializarUsuarios() {
    if (!verificarAcessoAdmin()) return;

    // Configurar menu lateral e cabeçalho
    const userEmail = localStorage.getItem('userEmail') || '';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Inicializar lista de usuários a partir da simulação do localStorage
    const dadosSalvos = localStorage.getItem('usuariosSimulados');
    if (dadosSalvos) {
        listaUsuarios = JSON.parse(dadosSalvos);
    } else {
        // Inicialização inicial com dados temporários
        listaUsuarios = [...USUARIOS_TEMPORARIOS_INICIAIS];
        localStorage.setItem('usuariosSimulados', JSON.stringify(listaUsuarios));
    }

    renderizarTabelaUsuarios();
}

/**
 * =========================================================================
 * 3. RENDERIZAÇÃO DINÂMICA DA TABELA
 * =========================================================================
 */
function renderizarTabelaUsuarios() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (listaUsuarios.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #64748b;">Nenhum usuário cadastrado.</td></tr>`;
        return;
    }

    listaUsuarios.forEach(usr => {
        const tr = document.createElement('tr');
        
        const nomeCompleto = `${usr.nome_usuario} ${usr.sobrenome_usuario}`;
        const badgeClass = usr.tipo_usuario === 'ADMIN' ? 'badge badge-danger' : 'badge badge-info';
        const tipoFormatado = usr.tipo_usuario === 'ADMIN' ? 'Administrador' : 'Usuário Padrão';

        tr.innerHTML = `
            <td><strong>${nomeCompleto}</strong></td>
            <td>${usr.email}</td>
            <td><span class="${badgeClass}">${tipoFormatado}</span></td>
            <td>
                <div class="btn-acoes">
                    <button class="btn-excluir" onclick="removerUsuario(${usr.id_usuario})">🗑️ Remover</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

/**
 * =========================================================================
 * 4. CADASTRO DE NOVO USUÁRIO (SQL V2 COMPATÍVEL)
 * =========================================================================
 */
function toggleForm() {
    const form = document.getElementById('userForm');
    if (form) {
        form.classList.toggle('hidden');
    }
}

async function saveUser(event) {
    event.preventDefault();

    const inputNome = document.getElementById('nome_usuario');
    const inputSobrenome = document.getElementById('sobrenome_usuario');
    const inputEmail = document.getElementById('email');
    const inputSenha = document.getElementById('senha');
    const selectTipo = document.getElementById('tipo_usuario');

    if (!inputNome || !inputSobrenome || !inputEmail || !inputSenha || !selectTipo) return;

    if (inputSenha.value.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    // Chaves estruturadas em perfeita conformidade com a tabela 'usuario' do SQL v2
    const novoUsuarioDB = {
        id_usuario: listaUsuarios.length > 0 ? Math.max(...listaUsuarios.map(u => u.id_usuario)) + 1 : 1,
        nome_usuario: inputNome.value.trim(),
        sobrenome_usuario: inputSobrenome.value.trim(),
        email: inputEmail.value.trim(),
        senha: inputSenha.value, // em produção estaria encriptado
        tipo_usuario: selectTipo.value, // ENUM 'USUARIO' ou 'ADMIN'
        data_criacao: new Date().toISOString()
    };

    try {
        console.log("Simulando persistência de Usuário no Banco (SQL v2):", novoUsuarioDB);

        listaUsuarios.push(novoUsuarioDB);
        localStorage.setItem('usuariosSimulados', JSON.stringify(listaUsuarios));

        alert('Usuário cadastrado com sucesso!');
        document.getElementById('newUserForm').reset();
        toggleForm();
        renderizarTabelaUsuarios();

    } catch (error) {
        console.error("Erro técnico ao salvar usuário:", error);
        alert("Erro técnico ao salvar o usuário.");
    }
}

/**
 * =========================================================================
 * 5. REMOÇÃO DE USUÁRIO
 * =========================================================================
 */
async function removerUsuario(id) {
    if (id === 1) {
        alert('Não é permitido remover o administrador principal do sistema.');
        return;
    }

    if (!confirm('Tem certeza de que deseja remover este usuário?')) return;

    try {
        console.log(`Simulando exclusão do ID: ${id} no Banco de Dados`);
        
        listaUsuarios = listaUsuarios.filter(usr => usr.id_usuario !== id);
        localStorage.setItem('usuariosSimulados', JSON.stringify(listaUsuarios));
        
        renderizarTabelaUsuarios();
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
    }
}

/**
 * =========================================================================
 * 6. NAVEGAÇÃO E LOGOUT
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

// Inicializa a página
document.addEventListener('DOMContentLoaded', inicializarUsuarios);
