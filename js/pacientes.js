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
 * 2. CONFIGURAÇÕES E INICIALIZAÇÃO
 * =========================================================================
 */
let pacientesAtuais = []; // Agora vai guardar os dados reais do banco

function inicializarPacientes() {
    if (!verificarAutenticacao()) return;

    // Carregar informações do cabeçalho/menu lateral
    const userEmail = localStorage.getItem('userEmail') || '';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Restrição de nível de acesso
    const btnUsuarios = document.getElementById('btnUsuarios');
    if (!isAdmin && btnUsuarios) {
        btnUsuarios.style.display = 'none';
    }

    // Configurar filtros dinâmicos
    configurarFiltros();

    // Carregar dados reais do Banco de Dados
    carregarPacientes();
}

/**
 * =========================================================================
 * 3. BUSCA E RENDERIZAÇÃO DOS DADOS (CONECTADO AO MYSQL)
 * =========================================================================
 */
async function carregarPacientes() {
    try {
        // Faz o GET na rota que criamos no server.js
        const resposta = await fetch('http://localhost:3000/api/pacientes');
        const dados = await resposta.json();

        if (dados.sucesso) {
            pacientesAtuais = dados.pacientes; // Salva na memória para os filtros funcionarem
            renderizarTabela(pacientesAtuais);
        } else {
            console.error("Erro do servidor:", dados.mensagem);
            document.getElementById('patientsTable').innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Erro ao carregar pacientes do banco de dados.</td></tr>`;
        }
    } catch (error) {
        console.error("Erro ao buscar lista de pacientes:", error);
        document.getElementById('patientsTable').innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Servidor offline. Verifique se o Node.js está rodando.</td></tr>`;
    }
}

function calcularIdade(dataNascimento) {
    if (!dataNascimento) return "-";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return `${idade} anos`;
}

function renderizarTabela(listaDePacientes) {
    const tabelaCorpo = document.getElementById('patientsTable');
    if (!tabelaCorpo) return;

    tabelaCorpo.innerHTML = '';

    if (listaDePacientes.length === 0) {
        tabelaCorpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #64748b;">Nenhum paciente encontrado.</td></tr>`;
        return;
    }

    listaDePacientes.forEach(paciente => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-sexo', paciente.sexo_paciente);

        const sexoExibicao = paciente.sexo_paciente === 'M' ? 'Masculino' : 'Feminino';
        const idadeCalculada = calcularIdade(paciente.data_nascimento_paciente);
        
        // Formatando data de nascimento (Lidando com o formato ISO que vem do MySQL)
        const dataFormatada = paciente.data_nascimento_paciente 
            ? new Date(paciente.data_nascimento_paciente).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
            : '';

        tr.innerHTML = `
            <td><strong>${paciente.nome_paciente}</strong></td>
            <td>${sexoExibicao}</td>
            <td>${idadeCalculada} (${dataFormatada})</td>
            <td>${paciente.nome_responsavel || '-'}</td>
            <td>
                <div class="btn-acoes">
                    <button class="btn-avaliar" onclick="navigate('../Secundarias/nova_avaliacao.html?id_paciente=${paciente.id_paciente}')">📋 Avaliar</button>
                    <button class="btn-excluir" onclick="excluirPaciente(${paciente.id_paciente})">🗑️ Remover</button>
                </div>
            </td>
        `;

        tabelaCorpo.appendChild(tr);
    });
}

/**
 * =========================================================================
 * 4. FILTROS DINÂMICOS
 * =========================================================================
 */
function configurarFiltros() {
    const inputNome = document.getElementById('searchName');
    const selectSexo = document.getElementById('filterSex');

    if (inputNome) inputNome.addEventListener('input', filtrarPacientes);
    if (selectSexo) selectSexo.addEventListener('change', filtrarPacientes);
}

function filtrarPacientes() {
    const buscaNome = document.getElementById('searchName')?.value.toLowerCase() || '';
    const filtroSexo = document.getElementById('filterSex')?.value || 'todos';

    // Filtra direto na memória usando a lista que veio do banco
    const pacientesFiltrados = pacientesAtuais.filter(paciente => {
        const correspondeNome = paciente.nome_paciente.toLowerCase().includes(buscaNome);
        const correspondeSexo = filtroSexo === 'todos' || paciente.sexo_paciente === filtroSexo;
        
        return correspondeNome && correspondeSexo;
    });

    renderizarTabela(pacientesFiltrados);
}

/**
 * =========================================================================
 * 5. REMOÇÃO DE PACIENTE (Pendente integração com Backend)
 * =========================================================================
 */
async function excluirPaciente(id) {
    if (!confirm('Deseja realmente remover este paciente?')) return;

    alert("Para apagar permanentemente, precisaremos criar uma rota DELETE no server.js. Faremos isso em seguida!");
    
    // Remove apenas visualmente da tela por enquanto
    pacientesAtuais = pacientesAtuais.filter(p => p.id_paciente !== id);
    renderizarTabela(pacientesAtuais);
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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');

    window.location.href = '../cadastro/login.html';
}

// Dispara o gatilho inicial ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializarPacientes);