/**
 * =========================================================================
 * 1. CONTROLE DE ACESSO E SEGURANÇA (APENAS ADMINISTRADORES)
 * =========================================================================
 */
function verificarAcessoAdmin() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!isAdmin) {
        alert('Acesso negado! Apenas administradores podem gerenciar usuários.');
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

/**
 * =========================================================================
 * 2. INICIALIZAÇÃO DA PÁGINA E CARREGAMENTO REAL DA API
 * =========================================================================
 */
let listaUsuarios = [];

function inicializarUsuarios() {
    if (!verificarAcessoAdmin()) return;

    // Configurar menu lateral e cabeçalho
    const userEmail = localStorage.getItem('userEmail') || '';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Carregar profissionais da clínica diretamente da API real
    carregarUsuarios();
}

async function carregarUsuarios() {
    try {
        const resposta = await fetch('http://localhost:3000/api/usuarios', { credentials: 'include' });
        const dados = await resposta.json();

        if (dados.sucesso) {
            listaUsuarios = dados.usuarios;
            renderizarTabelaUsuarios();
        } else {
            console.error("Erro do servidor ao buscar profissionais:", dados.mensagem);
            mostrarMensagemErroTabela("Erro ao carregar lista de profissionais.");
        }
    } catch (error) {
        console.error("Erro ao buscar profissionais no backend:", error);
        mostrarMensagemErroTabela("Erro de conexão. Verifique se o Node.js está online.");
    }
}

function mostrarMensagemErroTabela(msg) {
    const tableBody = document.getElementById('usersTableBody');
    if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red; padding: 15px;">${msg}</td></tr>`;
    }
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
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #64748b; padding: 15px;">Nenhum usuário cadastrado.</td></tr>`;
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
 * 4. CADASTRO DE NOVO USUÁRIO (INTEGRADO COM A API BACKEND)
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

    // Estrutura enviada na requisição real
    const novoUsuario = {
        nome_usuario: inputNome.value.trim(),
        sobrenome_usuario: inputSobrenome.value.trim(),
        email: inputEmail.value.trim(),
        senha: inputSenha.value,
        tipo_usuario: selectTipo.value // 'USUARIO' ou 'ADMIN'
    };

    try {
        const resposta = await fetch('http://localhost:3000/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(novoUsuario)
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            alert('Profissional cadastrado com sucesso no banco de dados!');
            document.getElementById('newUserForm').reset();
            toggleForm();
            // Recarrega lista
            carregarUsuarios();
        } else {
            alert('Erro ao cadastrar profissional: ' + dados.mensagem);
        }

    } catch (error) {
        console.error("Erro técnico ao salvar usuário:", error);
        alert("Erro técnico ao tentar cadastrar o profissional. Verifique se o Node.js está rodando.");
    }
}

/**
 * =========================================================================
 * 5. REMOÇÃO DE USUÁRIO (CONECTADO À API)
 * =========================================================================
 */
async function removerUsuario(id) {
    if (id === 1) {
        alert('Não é permitido remover o administrador principal do sistema.');
        return;
    }

    if (!confirm('Tem certeza de que deseja remover este profissional do sistema?')) return;

    try {
        const resposta = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            alert('Profissional removido com sucesso!');
            // Recarrega lista
            carregarUsuarios();
        } else {
            alert('Erro ao excluir profissional: ' + dados.mensagem);
        }
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro técnico ao tentar remover o profissional.");
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
    encerrarSessao('../cadastro/login.html');
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', inicializarUsuarios);
